/**
    Provides a way to dynamically generate client configurations to allow all configurations within Apps Mall and Ozone Platform to be handled within a single file.

    @module Ozone.Services.ClientConfiguration
    @class Ozone.Services.ClientConfiguration
    @submodule Server-Side
*/
(function () {
    module.exports = function (callback, Ozone) {
        var ejs = require("ejs");
        var fs = require("fs");

        var clientConf = fs.readFileSync(require("path").resolve(__dirname, "./config.ejs"), { encoding: "utf8" });

        var conf = {
            client: Ozone.config().getConfig().client,
            common: Ozone.config().getConfig().common
        };

        var clientConfRendered = ejs.render(clientConf, { conf: JSON.stringify(conf) });

        /**
            Provides a JavaScript file served to the client that automatically sets up the configuration
            within the Ozone API.

            @method /api/config/default.js
        */
        Ozone.Routing.get("config/default.js", function (req, res) {
            res.setHeader('content-type', 'text/javascript');
            res.end(clientConfRendered);
        });
    };
}());
