/**
	This module is DEPRECATED. It was originally created as part of the Ozone V2 work before direction
	changed to focus on Apps Mall completion instead of Ozone V2 finalizing. Due to this the Messenger
	service has not been tested or used since December of 2013 and is unlikely to work perfectly
	as it was originally a prototype.

	@module Ozone.Services
	@class Ozone.Services.Messaging
	@submodule Client-Side
	@deprecated
*/
var Messenger;

(function () {

	var socket = null;
	function _M () {
		var url;
		if (!socket) {
			if (typeof io != 'undefined') {
				url = getMessagingUrl();
				console.log("URL is " + url);
				socket = io.connect(url);
			} else {
				console.warn("warning: messaging won't work");
				socket = {
					on: function () {}
				};
			};


			socket.on('clientListUpdate', function (data) {
				_M.allClients.reset(data.clientList);
			});

			socket.on('channelListUpdate', function(response) {
				console.log('new channel list: ');
				console.dir(response.channelList);
				_M.allChannels.reset(response.channelList);
			});

			/*
			  The server has sent a message to targetID, which could be either a
			  client or a channel.  Find the client, or, if targetID is a channel,
			  find all local clients subscribed to the channel, and call the
			  receiveMessage method of those clients.
			*/
			socket.on('receive message', function (targetID, data) {
				var receiverClients = channelSubscribers.get(targetID) || { foo: _M.localClients.get(targetID) };
				for (key in receiverClients) {
					receiverClients[key].receiveMessage(data);
				};
				console.log("message received");
			});;

		};
	};

    /*
     GrumpySet won't let you add an item if it's already in there.
     stores only strings.

     Takes an optional setname parameter (currently only used for debugging),
     followed by an optional callback to be called whenever modifications are
     made to the set.
    */
    function GrumpySet(setname, updateCB) {
        var lookup = {};

        this.add = function (key, value) {
            if (key in lookup) {
                throw {
                    message: "There is already an object "+key+"in the lookup",
                    key: key
                }
            };
            lookup[key] = value;
            console.log("in grumpy add");
            updateCB && updateCB();
        }

        this.del = function (key) {
            delete lookup[key];
            updateCB && updateCB();
        }

        this.reset = function(hash) {
            lookup = hash;
            updateCB && updateCB();
        };

        this.get = function (key) { return lookup[key]; };

        this.getKeys = function () {
            var keylist = [], key;
            for (key in lookup) {
                keylist.push(key);
            };
            return keylist;
        };

        this.map = function (f) {
            var newArray = {}, key;
            for (key in lookup) {
                var value = lookup[key];
                newArray[key] = f(value);
            };
            return newArray;
        };
    };

    /*
      Callback passed to GrumpySet for Messenger clients.  We want each local
      client to run its clientsUpdated method in case the client maintains a
      list of all clients.
     */
    function localClientsUpdate() {
        _M.localClients.map(function (value) {
            value.clientsUpdated();
        });
    };

    // All clients in this browser window
    _M.localClients = new GrumpySet("localClients", localClientsUpdate);
    // All clients in the entire system -- in other browser windows, and on
    // other computers, but attached to this server.
    _M.allClients = new GrumpySet("allClients", localClientsUpdate);
    // All channels served by the system.
    _M.allChannels = new GrumpySet("allChannels", localClientsUpdate);
    var channelSubscribers = new GrumpySet("channelSubscribers");


    // Messenger prototype
    var p_messenger = {
        /*
         * CORE METHODS
         *
         * The methods in this section should NOT be overridden in a child
         * class. Unless you really want to. But don't say I didn't warn you.
         */

        /*
          sendMessage - send data of any type to a client.
         */
        sendMessage: function (targetID /* string, for now */, message) {
            var channel = _M.allChannels.get(targetID);
            //if (channel && (channel.channelType != "open"
            var target = _M.localClients.get(targetID);
            if (target) {
                target.receiveMessage({senderID: this.clientName, message: message});
            } else {
                socket.emit('sendMessage', targetID,
                            {senderID: this.clientName, message: message},
                            function(data) {
                                if (data.success) {
                                    console.log(data.success);
                                } else if (data.error) {
                                    console.log("Error: " + data.error);
                                };
                            })
            };
        },
        /*
          Any client can create a channel.  That channel must have a name not
          currently used by any existing client or channel.  If the client
          sends channelType: "oneway" in the options hash, then only the
          creating client can send messages on this channel.
         */
        createChannel: function (channelName, options) {
            socket.emit('create channel', channelName, this.clientName, options, function(response) {
                if (response.error) {
                    console.log("Error creating channel: " + response.error);
                }
            });
        },
        // Subscribe to a channel
        subscribe: function (channelName) {
            var channel = channelSubscribers.get(channelName);
            if (!channel) {
                channel = {};
                channelSubscribers.add(channelName, channel);
            };
            if (channel[this.clientName]) {
                console.log("this client already subscribed to this channel");
                return;
            };
            channel[this.clientName] = this;
            socket.emit('subscribe', channelName, this.clientName, function(result) {
                if (result.error) {
                    console.log("Subscription failed: " + result.error);
                    delete channel[this.clientName];
                };
            });
        },
        // Clients must call messengerInit after doing their own initialization.
        messengerInit: function (clientName) {
            var self = this;
            socket.emit("new client", {clientName:clientName}, function(data) {
                if (data.error) {
                    self.clientName = data.newName;
                    // TODO: provide a default implementation for clientNameRejected
                    self.clientNameRejected(clientName, data.newName);
                } else {
                    console.log("server message: " + data.message);
                    self.clientName = clientName;
                };
                _M.localClients.add(self.clientName, self);
                console.log("Added " +  self.clientName);
            });

        },
        /*
          Cleanup behavior before a client disconnects.
         */
        disconnect: function () {
            _M.localClients.del(this.clientName);
            socket.emit('drop client', this.clientName);
        },
        /*
          Allow a client to change its ID.  This is useful especially if the
          initially requreted name was rejected, and the server has assigned a
          randomly-generated name to the client.
         */
        changeID: function (newName) {
            console.log("in changeID, newName is %s, clientName is %s", newName, this.clientName);
            // TODO: potential race condition here?
            this.disconnect();
            this.messengerInit(newName);
        },

        /*
         * CLIENT SECTION
         *
         * The following are default methods that a child class may override
         */

        receiveMessage: function (message) {
            console.log("Client " + this.clientName + " should override the receiveMessage method");
            console.log("Received message:");
            console.dir(message);
        },
        clientsUpdated: function () {
            console.log('clientsUpdated called on ' + this.clientName);
        },
        clientNameRejected: function (requestedName, newName) {
            console.log("Could not assign the name %s.  Assigned the name %s.  Sorry.", requestedName, newName);
        }
    };

    _M.prototype = p_messenger;

    Messenger = _M;

	function getMessagingUrl() {
		if (typeof Ozone != 'undefined' && Ozone.config) {
			var config = Ozone.config();
			return config.getClientProperty("absoluteBaseUrl");
		} else {
			var url = 'http://localhost';
			if (typeof PORT !== 'undefined') { // PORT is defined in unit.spec.js for unit tests.
    			url += ':' + PORT;
    			console.log("messenger-->PORT: " + PORT);
			}
			return url;
		}
	};
	if (typeof Ozone != 'undefined' && Ozone.Service) {
		Ozone.Service("Messaging", _M);
	};
})();

if (typeof module !== "undefined" && typeof require !== "undefined") {
	module.exports = Messenger;
}
