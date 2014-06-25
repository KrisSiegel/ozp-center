/**
    The Messaging service was originally designed as part of the development of the Ozone Platform v2.
    The development was then halted to focus on Apps Mall v2. This means the messaging service is still
    in a state of 'prototype'. It's functional but doesn't have a finalized API around it (it's kinda wonky)
    and there is many aspects that are still very specific for testing.

    This service essentially wraps socket.io to create a channel between the client and server to allow async
    communication between the two. This also supports multiple screens.

    By default this module is disabled.

    @module Ozone.Services.Messaging
    @class Ozone.Services.Messaging
    @submodule Server-side
    @deprecated
*/
var PORT = 3000,
    logger;

function setup(callback, Ozone) {

    logger = logger || Ozone.logger;

    logger.debug("Messaging-->setup()");

    Ozone.Service().on("ready", "Server", function () {
    	logger.info("Messaging-->'Server' is ready!");

        var httpServer = Ozone.Service("Server").getHttpServer();
        if (Ozone.Utils.isFunction(Ozone.Service("Server").getHttpsServer)) {
        	var httpsServer = Ozone.Service("Server").getHttpsServer();
        }

        require('./ozone-messenger').listen(httpServer, Ozone);

        if (callback) callback(Ozone);
    });
}

module.exports = setup;

if (require.main === module) {
    var express = require('express');
    var app = express();
    var routes = require('./routes');
    var user = require('./routes/user');
    var http = require('http');
    var path = require('path');

    // all environments
    var PORT = process.env.PORT || PORT;
    app.set('port', PORT);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }

    app.get('/', routes.index);
    app.get('/users', user.list);

    var Ozone = require("../ozone-api")(app);
    logger = Ozone.logger;

    var httpServer = http.createServer(app);

    Ozone.Service("Server", {
    	getHttpServer: function () {
    		return httpServer;
    	}
    });

    //require('coffee-script');
    //require('./fakelog');

    setup(function () {
    	httpServer.listen(app.get('port'), function(){
    		logger.info('Messaging Node.js API on port %d', app.get('port'));
        });
    });

};
