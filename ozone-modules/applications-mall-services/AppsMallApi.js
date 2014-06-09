var PORT = 3000,
	logger;

function amlService (callback, Ozone) {
	var constants = require('./conf/constants'),
		appsStore = constants.database.store.apps,
		appsmallStore = constants.database.store.appsmall,
		appCollection = constants.database.collection.app,
		reviewCollection = constants.database.collection.review,
		store = constants.database.store.appsmall,
		async = require('async'),
		Persistence = Ozone.Service('Persistence');

	logger = logger || Ozone.logger;

    logger.debug("AppsMallService-->in setup method");

    Ozone.Service().on("ready", "Persistence", setupRouting);

	Ozone.Service(constants.AppsMallService, {
		export: function (callback) {
			Persistence.Store(appsmallStore).Collection(reviewCollection).query({}, {}, function (err, result) {
				callback.apply(this, [result]);
			});
		}
	});

    function setupRouting() {
        logger.debug("AppsMallService-->setup-->setupRouting()");
        Persistence = Ozone.Service('Persistence');
        // ensure indexes for Mongo
        async.parallel([

                function (callback) {
                    Persistence.Store(store).Collection(reviewCollection).addIndex({
                        app: 1,
                        user: 1,
                        reviewText: 'text'
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsMallService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsMallService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(reviewCollection).addIndex({
                    	user: 1,
                        reviewText: 'text'
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsMallService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsMallService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(reviewCollection).addIndex({
                        reviewText: 'text'
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsMallService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsMallService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(reviewCollection).addIndex({
                    	app: 1,
                        user: 1
                    }, { unique: true }, function (err, result) {
                        if (err) {
                            logger.error("AppsMallService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsMallService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                }
            ],
            // callback after parallel functions
            function (err, results) {
                logger.debug("AppsMallService-->setting up routes");

                require('./routes')(Ozone);

                if (callback) callback(Ozone);
            });
    }
};

module.exports = amlService;

// starting up web server on specified port
if (require.main === module) {
	var webServer = require('./ozoneServer'),
		app = webServer.init(),
		Ozone = require('../ozone-api')(app),
		logger = Ozone.logger;

    Ozone.configuration = {
        "Persistence": {
            "Module": "ozone-services-persistence-mongo",
            "Server": "localhost",
            "Port": 27017
        }
    };

    // also import Persistence Services when running as stand-alone here, since it's not running as part of the Container.
    require('ozone-services-persistence')(function () {
    	amlService(function() {
    		// Kick start REST controller process.
    	    app.listen(PORT);
    	    logger.info('AML Node.js API on port ' + PORT + '.');
    	});
    });
};
