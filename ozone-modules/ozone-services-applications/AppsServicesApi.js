var PORT = 3000,
    logger;

module.exports = function setup(callback, Ozone) {

    var Persistence = Ozone.Service('Persistence'),
        async = require('async'),
        constants = require('./constants'),
        appService = require('./service/AppService'),
        store = constants.database.store.apps,
        appCollection = constants.database.collection.app,
        componentCollection = constants.database.collection.component;

    appService.init(Ozone);
    logger = logger || Ozone.logger;

    logger.debug("AppsService-->in setup method");

    Ozone.Service().on("ready", "Persistence", setupRouting);

    function setupRouting() {
        logger.debug("AppsService-->setup-->setupRouting()");

        Persistence = Ozone.Service('Persistence');
        // ensure indexes
        async.parallel([

                function (callback) {
                    Persistence.Store(store).Collection(componentCollection).addIndex({
                        name: 'text',
                        shortname: 'text',
                        description: 'text',
                        descriptionShort: 'text'
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring text indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(componentCollection).addIndex({
                        name: 1,
                        shortname: 1,
                        createdOn: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring text indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(componentCollection).addIndex({
                        name: 1,
                        shortname: 1,
                        createdOn: -1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring text indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(componentCollection).addIndex({
                        shortname: 1,
                        createdOn: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring text indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(componentCollection).addIndex({
                        shortname: 1,
                        createdOn: -1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring text indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(componentCollection).addIndex({
                        shortname: 1,
                        createdOn: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(componentCollection).addIndex({
                        shortname: 1,
                        createdOn: -1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(componentCollection).addIndex({
                        createdOn: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(appCollection).addIndex({
                        name: 'text',
                        shortname: 'text',
                        description: 'text',
                        descriptionShort: 'text'
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring text indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(appCollection).addIndex({
                        name: 1,
                        shortname: 1,
                        createdOn: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(appCollection).addIndex({
                        name: 1,
                        shortname: 1,
                        createdOn: -1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(appCollection).addIndex({
                        shortname: 1,
                        createdOn: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(appCollection).addIndex({
                        shortname: 1,
                        createdOn: -1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(appCollection).addIndex({
                        shortname: 1,
                        createdOn: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(appCollection).addIndex({
                        shortname: 1,
                        createdOn: -1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(appCollection).addIndex({
                        createdOn: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("AppsService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("AppsService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                }
            ],
            // callback after parallel functions
            function (err, results) {
                logger.debug("AppsService-->setting up routes");

                require('./routes')(Ozone);

                // expose the AppService(only the import method for now) to server-api
                Ozone.Service(constants.AppService, appService);

                if (callback) callback(Ozone);
            });
    }
};
