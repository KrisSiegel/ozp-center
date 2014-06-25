/**
    Provides routing capabilities with a similar method signature to express.js. All http verbs provides by
    express.js are also available here with the same function signature.

    @module Ozone
    @submodule Server-Side
    @class Ozone.routing
*/
Ozone.extend(function () {
    var methods = require("methods");
    var mime = require("mime");
    var current = { };

    var routing = {
        kill: {
            /**
                This is a simple helper method that ends a request and sends back the HTTP 403 status code along with a custom message if specified.

                @method kill.notEnoughAccess
                @param {Object} req the incoming request object
                @param {Object} res the outgoing response object
                @param {String} msn (optional) the message to display when sending back a 403
            */
            notEnoughAccess: function (req, res, msg) {
                Ozone.logger.info("Ozone.routing -> kill route due to not enough access.");
                if (!Ozone.utils.isUndefinedOrNull(res)) {
                    res.statusCode = 403;
                    res.end(msg || "User does not have proper access to this function");
                }
            },
            /**
                This is a simple helper method that ends a request and sends back the HTTP 401 status code along with a custom message if specified.

                @method kill.notLoggedIn
                @param {Object} req the incoming request object
                @param {Object} res the outgoing response object
                @param {String} msn (optional) the message to display when sending back a 401
            */
            notLoggedIn: function (req, res, msg) {
                Ozone.logger.info("Ozone.routing -> kill route due to not being logged in.");
                if (!Ozone.utils.isUndefinedOrNull(res)) {
                    res.statusCode = 401;
                    res.end(msg || "User is not logged in");
                }
            }
        },
        helpers: {
            /**
                Provides a wrapper around the typical res.send(data) method call. If a query string key value of export=true is attached to a request
                then this method will automatically export it as whatever file type and file name the consuming service tells it do. Basically a little
                shortcut to handling file names and data types at one location versus each service itself.

                @method helpers.send
                @param {Object} req the incoming request object
                @param {Object} res the outgoing response object
                @param {Object} data the data to send in the response
                @param {String} fileName (optional) the filename to send in the response
                @param {String} mimeType (optional) the mime type of a file to send back
            */
            send: function (req, res, data, fileName, mimeType) {
                if (!Ozone.utils.isUndefinedOrNull(res)) {
                    if (Ozone.utils.safe(current, "req.query.export") !== undefined && req.query.export === "true") {
                        var fName = (fileName || "export.json");
                        res.setHeader('Content-type', (mimeType || mime.lookup(fName) || "application/json"));
                        res.setHeader('Content-disposition', 'attachment; filename=' + fName);
                    }
                    res.send(data);
                }
            }
        }
    }
    /**
        Methods for accessing

        @method Ozone.routing.<verb>
        @param {String} path the path to access the RESTful endpoint (this is automatically prepended with apiBaseUrl)
        @param {Object} access (optional) an object that can specify what's requested to access this resource. It can contain a loggedIn key with a boolean value and a permissions array which can be an array of permissions required.
        @param {Method} callback the callback to call should the consumer be granted access to the endpoint. Includes req, res and next parameters just like express.js
        @param {Object} context (optional) the context in which the callback is run can be optionally specified though is rarely necessary.
    */
    for (var i = 0; i < methods.length; ++i) {
        (function (meth) {
            routing[meth] = (function (path, access, callback, context) {
                var finalPath = Ozone.utils.murl("apiBaseUrl", path, false);
                context = context || this;
                Ozone.Service("ApplicationEngine")[meth].apply(Ozone.Service("ApplicationEngine"), [finalPath, function (req, res, next) {
                    if (Ozone.utils.isFunction(access)) {
                        if (!Ozone.utils.isUndefinedOrNull(callback)) {
                            context = callback;
                            callback = access;
                            access = undefined;
                        } else {
                            callback = access;
                            access = undefined;
                        }
                    }
                    if (Ozone.utils.isUndefinedOrNull(access)) {
                        access = { loggedIn: false };
                    }
                    if (Ozone.utils.safe(access, "loggedIn") === undefined) {
                        if (Ozone.utils.safe(access, "permissions") !== undefined) {
                            access.loggedIn = true;
                        } else {
                            access.loggedIn = false;
                        }
                    }

                    Ozone.logger.debug("Ozone Routing -> " + meth + " -> " + finalPath);
                    var killed = false;
                    if (Ozone.config().getServerProperty("security.disableSecurityCheckOnRoutes") !== true) {
                        if (access.loggedIn === true && Ozone.utils.safe(req, "session.user.persona") === undefined) {
                            killed = true;
                            routing.kill.notLoggedIn(req, res);
                        }
                        var currentPersona = Ozone.utils.safe(req, "session.user.persona");
                        if (access.loggedIn === true && !Ozone.utils.isUndefinedOrNull(access.permissions)) {
                            if (!Ozone.Service("Personas").persona.hasPermission(currentPersona, access.permissions)) {
                                Ozone.logger.debug("Ozone Routing -> Checking Permissions: " + access.permissions)
                                killed = true;
                                routing.kill.notEnoughAccess(req, res);
                            }
                        }
                    }

                    if (!killed) {
                        Ozone.logger.debug("Ozone.routing -> Cleared access check; proceeding with route.");
                        callback.apply(context, [req, res, next]);
                    }
                }]);
            });
        }(methods[i]));
    }

    return {
        Routing: routing,
        routing: routing
    };
}());
