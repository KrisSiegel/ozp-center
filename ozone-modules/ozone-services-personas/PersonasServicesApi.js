var PORT = 3000,
    logger;

function setup(callback, Ozone) {

    var Persistence = Ozone.Service('Persistence'),
        personasService = require('./service/PersonasService'),
        async = require('async'),
        constants = require('./config/constants'),
        store = constants.database.store.personas,
        personaCollection = constants.database.collection.persona,
        permissionsCollection = constants.database.collection.permisions,
        rolesCollection = constants.database.collection.roles;

    personasService.init(Ozone);
    logger = logger || Ozone.logger;

    logger.debug("PersonasService-->in setup method");

    Ozone.Service().on("ready", "Persistence", setupRouting);

    function setupRouting() {
        logger.debug("PersonasService-->setup-->setupRouting()");
        Persistence = Ozone.Service('Persistence');
        // ensure indexes
        async.parallel([

                function (callback) {
                    Persistence.Store(store).Collection(personaCollection).addIndex({
                    	userId: 1,
                        username: 1,
                        auth_token: 1,
                        auth_service: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("PersonasService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("PersonasService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(personaCollection).addIndex({
                    	username: 1,
                        auth_token: 1,
                        auth_service: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("PersonasService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("PersonasService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(personaCollection).addIndex({
                        auth_token: 1,
                        auth_service: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("PersonasService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("PersonasService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(personaCollection).addIndex({
                        auth_service: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("PersonasService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("PersonasService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(permissionsCollection).addIndex({
                        designation: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("PersonasService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("PersonasService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                },
                function (callback) {
                    Persistence.Store(store).Collection(rolesCollection).addIndex({
                        designation: 1
                    }, function (err, result) {
                        if (err) {
                            logger.error("PersonasService-->Error while ensuring indexes: " + err);
                            throw err;
                        };
                        logger.debug("PersonasService-->ensured index: " + JSON.stringify(result, null, 3));

                        callback();
                    });
                }
            ],
            // callback after parallel functions
            function (err, results) {
                logger.debug("PersonasService-->setting up routes");

                require('./routes')(Ozone);

                Ozone.Service(constants.PersonasService, personasService);

                if (callback) callback(Ozone);
            });
    }

}

module.exports = setup;
