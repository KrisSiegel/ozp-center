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
