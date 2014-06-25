/**

    @module Ozone.Services.Personas
    @class Ozone.Services.Personas.RESTful
    @submodule Server-Side
*/
var personaBaseURL = require('../config/constants.json').urls.persona;
var permissionBaseURL = require('../config/constants.json').urls.permission;
var roleBaseURL = require('../config/constants.json').urls.role;

module.exports = exports = function (Ozone) {

    var routing = Ozone.Routing,
    	logger = Ozone.logger,
    	personasService = require('../service/PersonasService');

	personasService.init(Ozone);

    /**
        @method /personas/persona/current GET
        @return {Object} the current persona object
    */
    routing.get(personaBaseURL + '/current', { loggedIn: true }, function (req, res, next) {

        logger.debug("Routes(PersonasService)-->get current persona");

        if (Ozone.utils.safe(req, "session.user.persona") === undefined) {
            res.statusCode = 401;
        	res.send({'error':'No current persona found.'});
        } else {
        	res.send(req.session.user.persona);
        }

    });

    /**
        Updates the specified persona

        @method /personas/persona/:personaId POST
    */
    routing.post(personaBaseURL + '/:personaId', { loggedIn: true }, function (req, res, next) {

        logger.debug("Routes(PersonasService)-->update persona id " + req.params.personaId);

        personasService.getById(req.params.personaId, function (err, result) {
            var persona = result[0];
            var userPersona;
            if (req.session.user !== undefined) {
                userPersona = req.session.user.persona;
            }
            if (persona === undefined) {
                res.statusCode = 404;
                res.send({'error':'No current persona found.'});
            } else {
                var item = {};
                if (req.body.username) item.username = req.body.username;
                if (req.body.auth_token) item.auth_token = req.body.auth_token;
                if (req.body.auth_service) item.auth_service = req.body.auth_service;
                if (req.body.meta) item.meta = req.body.meta;

                logger.debug("Routes(PersonasService)-->updating persona: " + JSON.stringify(persona, null, 3));
                logger.debug("Routes(PersonasService)-->using item: " + JSON.stringify(item, null, 3));

                var oldPerms = (Ozone.utils.safe(persona, "meta.permissions") || []).sort();
                var newPerms = (Ozone.utils.safe(item, "meta.permissions") || []).sort();

                if (!Ozone.utils.arrayContains(userPersona.permissions, ["/Ozone/Apps/App/AppsMall/GrantPermission/"])) {
                    if (!Ozone.utils.compareArray(oldPerms, newPerms)) {
                        //return routing.kill.notEnoughAccess(res);
                    }
                }

                personasService.update(persona._id, item, function (err, result) {
                    if (err) {
                        logger.error('Error updating persona: ' + err);
                        res.statusCode = 500;
                        res.send({
                            'error': 'An error has occurred - ' + err
                        });
                    }

                    // update the persona in session
                    if (Ozone.utils.safe(req, "session.user.persona") !== undefined) {
                        if (req.session.user.persona._id === ("" + result._id)) {
                            logger.debug("Routes(PersonasService)->updating session");
                            req.session.user.persona = result;
                        }
                    }

                    res.send(result);
                });
            }
        });
    });

    /**
        @method /personas/persona/:userId GET
        @return {Object} the specified persona object
    */
    routing.get(personaBaseURL + '/:userId', { loggedIn: true }, function (req, res) {
    	var userId = req.params.userId;

        logger.debug("Routes(PersonasService)-->get by userId: " + userId);

        personasService.getById(userId, function (err, result) {
            if (err) {
                logger.error('Error getting personas: ' + err);
                res.send({
                    'error': 'An error has occurred - ' + err
                });
                return next(err);
            }

            //logger.debug("'get' result: " + JSON.stringify(result));
            if (result === undefined || result === null) {
                res.statusCode = 404;
            }
            res.send(result);
        });
    });

    /**
        Queries for personas based on userId or username or auth_token or auth_service

        @method /personas/persona/ GET
        @return {Object} all of the personas found
    */
    routing.get(personaBaseURL, { loggedIn: true }, function (req, res) {
    	var selector = {};
    	if (req.query.userId) selector._id = req.query.userId;
    	if (req.query.username) selector.username = req.query.username;
    	if (req.query.auth_token) selector.auth_token = req.query.auth_token;
    	if (req.query.auth_service) selector.auth_service = req.query.auth_service;

        logger.debug("Routes(PersonasService)-->in get, selector: " + JSON.stringify(selector));

        personasService.query(selector, function (err, result) {
            if (err) {
                logger.error('Error getting personas: ' + err);
                res.send({
                    'error': 'An error has occurred - ' + err
                });
                return next(err);
            }

            if (req.session.user === undefined) {
                res.statusCode = 401;
            } else if (result === undefined || result === null) {
                res.statusCode = 404;
            }
            res.send(result);
        });
    });


    /**
        Creates a new persona object

        @method /personas/persona POST
    */
    routing.post(personaBaseURL, { loggedIn: true }, function (req, res, next) {
        if (req.session.user === undefined) {
            res.statusCode = 401;
            res.send();
        } else {
        	var item = {};
        	if (req.body.username) item.username = req.body.username;
        	item.auth_token = req.body.auth_token || id(); // random string for now
        	if (req.body.auth_service) item.auth_service = req.body.auth_service;
        	if (req.body.meta) item.meta = req.body.meta;

            logger.debug("Routes(PersonasService)-->in create, item: " + JSON.stringify(item));

            personasService.create(item, function (err, result) {
                if (err) {
                    logger.error('Error creating persona: ' + err);
                    res.send({
                        'error': 'An error has occurred - ' + err
                    });
                    return next(err);
                }

                //logger.debug("'post' result: " + JSON.stringify(result));
                res.send(result); // send whole object back?
            });
        }
    });

    /**
        @method /personas/persona/:userId DELETE
    */
    routing.delete(personaBaseURL + '/:userId', { loggedIn: true }, function (req, res, next) {
        if (req.session.user === undefined) {
            res.statusCode = 401;
            res.send();
        } else {
        	var userId = req.params.userId;

            logger.debug("Routes(PersonasService)-->in delete, userId: " + userId);

            personasService.delete(userId, function (err, result) {
            	if (err) {
    				logger.error("Routes(PersonasService)-->delete-->error: " + err);
    				res.send({ 'error' : 'An error has occurred - ' + err });
    				return next();
    			}
            	res.send(result);
            });
        }
    });

    /**
        @method /personas/permissions/ GET
        @return {Object} the permissions objects
    */
    routing.get(permissionBaseURL, { loggedIn: true, permisions: [] }, function (req, res, next) {
        personasService.permissions.query({

        }, function (err, result) {
            res.send(result);
        });
    });

    /**
        Returns the roles contained within the system. When the mock security module is used all roles are returned
        without requiring authentication otherwise authentication is required.
        
        @method /personas/roles/ GET
        @return {Object} the roles objects of the system
    */
    var usingMockSecurity = (Ozone.config().getServerProperty("security.module") === "ozone-services-security-mock");
    routing.get(roleBaseURL, { loggedIn: !usingMockSecurity }, function (req, res, next) {
        var selector = { };
        if (req.query.designation) {
            selector.designation = req.query.designation;
        }
        personasService.roles.query(selector, function (err, result) {
            res.send(result);
        });
    });
};

function id() {
	var charSet = "abcdefghijklmnopqrstuvwxyz0123456789";
	var result = [];
	for (var i = 0; i < 24; ++i) {
		result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
	}
	return result.join("");
};
