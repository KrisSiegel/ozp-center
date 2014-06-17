var Ozone = null,
	logger = null,
	mongo = require('mongodb'),
    MongoClient = mongo.MongoClient,
    fs = require('fs');

module.exports = {
    _db: null,
    setDb: function(db) {
    	_db = db;
    },
    init: function (_ozone, callback) {
		Ozone = _ozone;
		logger = Ozone.logger;
        logger.debug("Persistence service-->MongoConnect-->_db: " + this._db);
        if (this._db === null) {
            logger.debug("Persistence service-->MongoConnect-->_db is null");
            var context = this,
            	connectionURL = getConnectionURL();

            logger.info("Persistence service-->MongoConnect-->connectionURL: " + connectionURL);

            MongoClient.connect(connectionURL, function(err, db) {
            	if (err) {
                    logger.error("Persistence service-->MongoConnect-->error while opening mongoClient: " + err);
                    return callback(err);
                }
                logger.info("Persistence service-->MongoConnect-->connected");
                logger.debug("Persistence service-->MongoConnect-->setting db");

                context.setDb(db);
                callback(err, db);
            });


        } else {
            logger.debug('Persistence service-->MongoConnect-->we already have a db.');
            callback(null, this._db);
        }
    },
    getDb: function() {
    	return _db;
    }
};

var getConnectionURL = function() {
	var persistenceConfig = Ozone.config().getServerProperty("persistence");

	if (Ozone.config().getServerProperty("persistence.mongo.connectionString") !== undefined && Ozone.config().getServerProperty("persistence.mongo.connectionString").trim().length > 0) {
		logger.debug("Persistence service-->MongoConnect-->getConnectionURL-->using ConnectionURL from Ozone config: " + Ozone.config().getServerProperty("persistence.mongo.connectionString"));
		return Ozone.config().getServerProperty("persistence.mongo.connectionString");
	}

	var serverConfigs = Ozone.config().getServerProperty("persistence.mongo.servers"),
		serverList = [];
		connectionURL = 'mongodb://';

	if (!Ozone.utils.isUndefinedOrNull(serverConfigs) && Ozone.utils.isString(serverConfigs)) {
		var hosts = serverConfigs.split(",");
		var servers = [];
		for (var i = 0; i < hosts.length; ++i) {
			var portIndex = hosts[i].indexOf(":");
			var host;
			var port;
		    if (portIndex !== -1) {
		        host = hosts[i].substring(0, portIndex);
				port = hosts[i].substring(portIndex + 1, hosts[i].length);
		    }
			if (host === undefined) {
				host = hosts[i];
			}
		    var o = {
				"host": host,
		    	"port": (port || 27017)
			};

			servers.push(o);
		}
		serverConfigs = servers;
	}

	for (var i = 0; i < serverConfigs.length; i++) {
		var serverConfig = serverConfigs[i],
		serverURL = '';

        serverConfig.user = serverConfig.user || Ozone.config().getServerProperty("persistence.mongo.user");
        serverConfig.password = serverConfig.password || Ozone.config().getServerProperty("persistence.mongo.password");
		if (!Ozone.utils.isUndefinedOrNull(serverConfig.user) && !Ozone.utils.isUndefinedOrNull(serverConfig.password) && i === 0) {
			serverURL += encodeURIComponent(serverConfig.user) + ":" + encodeURIComponent(serverConfig.password) + "@";
		}

		serverURL += serverConfig.host + ":" + serverConfig.port;

		serverList.push(serverURL);
	}

	connectionURL += serverList.join(",") + "/" + (Ozone.config().getServerProperty("persistence.store") !== undefined ? Ozone.config().getServerProperty("persistence.store") : "Ozone");

	return connectionURL;
};
