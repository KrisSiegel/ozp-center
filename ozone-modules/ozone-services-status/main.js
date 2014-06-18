/**
    The status module provides access to information regarding what is or isn't started via REST.

    Contents only accessible via RESTful APIs.

    @module Ozone.Services.Status
    @class Ozone.Services.Status
    @submodule Server-Side
*/
(function () {
    module.exports = function (callback, Ozone) {
        var status = require("./status")(Ozone);
        /**
            Provides a JSON response containing a listing of Ozone Modules and their current status.

            @method /api/status
        */
        Ozone.Routing.get("status", { loggedIn: false }, function (req, res, next) {
            status.registeredServices = [];
            for (var key in Ozone.Service().registeredServices) {
                if (Ozone.Service().registeredServices.hasOwnProperty(key)) {
                    status.registeredServices.push(key);
                }
            }
            res.send(status);
        });

        /**
            Provides an output of the generated configuration (default.js + specified environment file merged) in a JSON response.
            NOTE: exposing this isn't always the best idea. In order to enable this both the serveFullConfigToSysAdmins configuration
            option needs to be true AND the user MUST have the /Ozone/System/Administration/ permission.

            @method /api/status/config
        */
        if (Ozone.config().getServerProperty("serveFullConfigToSysAdmins") === true) {
            Ozone.Routing.get("status/config", { loggedIn: true, permissions: ["/Ozone/System/Administration/"] }, function (req, res, next) {
                res.setHeader('content-type', 'text/javascript');
                res.send(JSON.stringify(Ozone.config().getConfig(), null, 4));
            });
        }
    };
}());
