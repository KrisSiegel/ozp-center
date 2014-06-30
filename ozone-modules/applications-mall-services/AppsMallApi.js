/**
 *  Provides some basic Apps Mall services. Note: this module has a bit of old code from the previous maintainers that hasn't been prioritized for clean-up; 
 *  this should be done at some point in the near future to maintain good maintainability.
 *
 *  @module Ozone.Services.AppsMall
 *  @class Ozone.Services.AppsMall
 *  @submodule Server-Side
 */

var PORT = 3000,
	logger;

/**
 * The AppsMall service object
 * @method amlService
 * @param callback {Function} Method invoked with (```result```) parameter after service has been loaded
 * @param Ozone {Object} the Ozone API object
 */
function amlService(callback, Ozone) {
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

    /**
     * Initializing Persistence routes and indexes
     * @method setupRouting
     * @private
     */
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
                        reviewText: 1
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
                        reviewText: 1
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
