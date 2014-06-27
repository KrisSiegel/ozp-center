/**
    The mock security service ensures users are logged in but also registers routes to allow anyone to login as
    any user and with any role they request.

    Accessible and registers at Ozone.Service("Security")

    @module Ozone.Services.Security
    @class Ozone.Services.Security.Mock
    @submodule Server-Side
*/
(function () {
    "use strict";
    module.exports = function (callback, Ozone) {
        Ozone.Service("Security", {
            /**
                Returns the middleware method that handles authenticating requests and logging the user in.

                @method getMiddleware
            */
            getMiddleware: function () {
                return function(req, res, next) {
                    Ozone.logger.info("Mock Security -> Inpecting route");
                    if (Ozone.utils.safe(req, "req.session.cookie") !== undefined) {
                        req.session.cookie.maxAge = Ozone.config().getServerProperty("session.maxAge");
                    }
                    if (Ozone.utils.safe(req, "session.user") === undefined) {
                        var autoLogin = Ozone.config().getServerProperty("security.mock.autoLogin");
                        if (!Ozone.utils.isUndefinedOrNull(autoLogin)) {
                            Ozone.Service("Personas").persona.login({
                                username: autoLogin,
                                auth_token: autoLogin,
                                auth_service: "Mock",
                                ensure: true,
                                overriding_role: Ozone.config().getServerProperty("security.mock.overriding_role"),
                                overriding_favorites: Ozone.config().getServerProperty("security.mock.favoriteApps"),
                                overriding_recent_launches: Ozone.config().getServerProperty("security.mock.recentApps"),
                                success: function (persona) {
                                    next();
                                },
                                error: function (err) {
                                    next();
                                }
                            }, req, res);
                        } else {
                            next();
                        }
                    } else {
                        next();
                    }
                }
            }
        });

        Ozone.Service().on("ready", "ApplicationEngine", function () {
            Ozone.Service("ApplicationEngine").use(Ozone.Service("Security").getMiddleware());
        });

        Ozone.Service().on("ready", "Personas", function () {
            require("./routes/index.js")(Ozone);
        });
    };
}());
