Ozone.extend(function () {
    var methods = require("methods");
    var mime = require("mime");
    var current = { };

    var routing = {
        kill: {
            notEnoughAccess: function (req, res, msg) {
                Ozone.logger.info("Ozone.routing -> kill route due to not enough access.");
                if (!Ozone.utils.isUndefinedOrNull(res)) {
                    res.statusCode = 403;
                    res.end(msg || "User does not have proper access to this function");
                }
            },
            notLoggedIn: function (req, res, msg) {
                Ozone.logger.info("Ozone.routing -> kill route due to not being logged in.");
                if (!Ozone.utils.isUndefinedOrNull(res)) {
                    res.statusCode = 401;
                    res.end(msg || "User is not logged in");
                }
            }
        },
        helpers: {
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
