var logger;

/*
  Like .map in ES6, but for an object.  If no fn is supplied, supply an empty
  object as the value.  This latter case can be useful for creating a
  serializable hash where the keys are the only thing that is important.
*/
function obj_map(hash, fn) {
    var keys = {}, key;
    for (key in hash) {
        
        keys[key] = (typeof fn == 'function') ? fn(hash[key]) : {};
    };
    return keys;
};

// Create a simple hash that is JSONifiable
function getFlatHash (hash) {
    return obj_map(hash);
}

var io;

// Unique sockets as defined by socket.io.  keys are socket.id's (provided by
// socket.io), and values are the socket objects.
var allSockets = {};
// Keep track of all clients to make sure there are no duplicate IDs
var messengerClients = {};
var channels = {};

// Broadcast the list of channels to all clients.  This is normally called
// when the list of available channels changes
function broadcastChannelList() {
    var channelListOut = obj_map(channels, function (channel) {
        return {
            name: channel.name,
            options: channel.options
        }
    });
    io.sockets.emit('channelListUpdate', {channelList: channelListOut});
};

/*
  create a channel.  socketid may be undefined (i.e., not provided in the
  argument list) if the "client" is internal to the server.  See sendMessage
  to get an idea of how socketid is used.
*/
exports.createChannel =  function (channelName, creatorName, options, fn, socketid) {
    if (channelName in channels || channelName in messengerClients) {
        fn({error: "The name " + channelName + " is already in use"});
        return;
    };
    channels[channelName] = { name: channelName,
                              creatorName: creatorName,
                              socketid: socketid,
                              subscribers: {},
                              options: options };

    broadcastChannelList();
};
/*
  Handler for when a client calls 'sendMessage' on socket.io.  Identifies the
  socket that has the target client (from targetID), or sockets that have
  subscribing clients if targetID refers to a channel, and sends a 'receive
  message' with the data to those sockets.

  Can also be called by a "client" that is internal to the server.
*/
exports.sendMessage = function (targetID, data, fn, socketid) {
    logger.debug('Messaging-->index-->sendMessage called for %s with data ' + data.message, targetID);
    try {
        var targetObj = messengerClients[targetID];
        var channel = channels[targetID];
        if (targetObj) {
            var targetSocket = allSockets[targetObj.socketid];
            targetSocket.emit('receive message', targetID, data);
        } else if (channel) {
            var errors = [];
            // If channelType is "oneway", the socketid and the targetID are
            // used together to check that the sender is the creator of the
            // channel.
            if (channel.options.channelType == "oneway") {
                if (data.senderID != channel.creatorName) {
                    errors.push("ID " + data.senderID + " doesn't match creator name " + channel.creatorName);
                };
                if (socketid != channel.socketid) {
                    errors.push("calling socket ID " + socketid + " doesn't match socket ID of channel creator " + channel.socketid);
                };
                if (errors.length != 0) {
                    fn({error: "Client not authorized to write to this channel",
                       details: errors});
                    return;
                };
            };
            var targetSockets = {};
            for (clientid in channel.subscribers) {
                // Add the relevent socket for this client to the set
                if (messengerClients[clientid]) 
                    targetSockets[messengerClients[clientid].socketid] = 1
            };
            logger.debug("Messaging-->index-->Target sockets are:");
            console.dir(targetSockets);
            for (var socketid in targetSockets) {
                allSockets[socketid].emit('receive message', targetID, data);
            };
        };
        fn({success: 'received sendMessage'});
    } catch (e) {
        var msg = "Error forwarding message: perhaps " + targetID + " does not exist";
        logger.debug(e + ": " + msg);
        fn({error: msg});
    };
};

/*
  Essentially the "main" for the messenger bus.  Set up all the server-side
  handlers (many of which are defined above as separate functions).
*/
exports.listen = function (server, _ozone) {
	Ozone = _ozone;
	logger = Ozone.logger;
    io = require('socket.io').listen(server);
    logger.debug("Messaging-->index-->io listening.");
    
    var clientServer = require('./serveStatic');
    clientServer.init(server, {
        '/ozone/messenger.js': '../public/js/messenger.js'
    });
    io.sockets.on('connection', function (socket) {
    	logger.debug("Messaging-->index-->io on connection.");
        // connectionClients keeps track of clients attached to this socket, so
        // they can be de-registered when the connection is broken
        var connectionClients = {};
        allSockets[socket.id] = socket;
        socket.on('new client', function newClient (data, fn) {
            var clientName = data.clientName;
            logger.debug("Messaging-->index-->got new client request -- " + data.clientName);
            if (messengerClients[clientName]) {
                clientName = "client-" + Math.random();
                fn({error: "Rejecting requested name -- already exists",
                    newName: clientName});
            } else {
                fn({message: "added " + data.clientName});
            };
            messengerClients[clientName] = {socketid: socket.id};
            connectionClients[clientName] = {};
            io.sockets.emit('clientListUpdate', {clientList: messengerClients});
        });

        socket.on('create channel', function (channelName, creatorName, options, fn) {
            exports.createChannel(channelName, creatorName, options, fn, socket.id);
        });
        // subscribe to a channel
        socket.on('subscribe', function (channelName, clientName, fn) {
            var channel = channels[channelName];
            if (!channel) {
                fn(channel + ": no such channel");
                return;
            };
            try {
                channel.subscribers[clientName] = {};
            } catch (e) {
                fn({ error: "Error setting client as subscriber" });
            };
            fn({ success: clientName + "Successfully subscribed to channel " + channelName});
        });
        socket.on('sendMessage', function (targetID, data, fn) {
            exports.sendMessage(targetID, data, fn, socket.id);
        });
        socket.on('drop client', function dropClient (clientName) {
            if (typeof connectionClients[clientName] == 'undefined') {
                logger.debug("Messaging-->index-->Client %s does not belong to the socket requesting disconnect", clientName);
                return;
            };
            delete messengerClients[clientName];
            delete connectionClients[clientName];
            // Should consider removing this ID from all channel
            // subscriber lists as well
        });

        socket.on('changeID', function (oldName, newName) {
            dropClient(oldName);
            newClient({clientName: newName});
        });

        /*
         This essentially covers the case where this socket closes (browser
         window closes, navigates away from the page, or other reasons).
         Delete all references to clients hosted on the corresponding page, so
         the names can be reused (esp. if the reason for the disconnect was a
         browser refresh).
        */
        socket.on('disconnect', function () {
            logger.debug('Messaging-->index-->Hey, browser disconnected');
            for (var key in connectionClients) {
                delete messengerClients[key];
            };
            connectionClients = {};
        });
        // Not sure we need this...
        broadcastChannelList()
    });
};
