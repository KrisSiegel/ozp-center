module.exports = (function (environment) {
    var pack = require("./package.json");
    var express = require("express");
    var app = express();
    var Ozone = require("./ozone-modules/ozone-api");

    // Initialize configuration
    Ozone.config(require("./config/default.js"), require("./config/environments/" + environment + ".js"));

    // Extensive logging.
    app.use(express.logger(Ozone.config().getServerProperty("expressLogger")));

    // Register the ApplicationEngine service (aka Express currently)
    Ozone.Service("ApplicationEngine", app);

    // Drop X-Powered-By header
    app.disable('x-powered-by');

    // Load the appropriate session module
    Ozone.load(__dirname, Ozone.config().getServerProperty("ozoneModules.session"));

    // Upload limit and upload directory settings
    app.use(express.bodyParser({
        limit: Ozone.config().getServerProperty("requestSizeLimit") || "25mb",
        uploadDir: Ozone.config().getServerProperty("uploadDir") || require("os").tmpdir()
    }));

    // Setup CORS middleware
    app.use(function (req, res, next) {
        var oneof = false;
        if(req.headers.origin) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            oneof = true;
        }
        if(req.headers['access-control-request-method']) {
            res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
            oneof = true;
        }
        if(req.headers['access-control-request-headers'] && req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
            oneof = true;
        }
        if(oneof) {
            res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
        }

        res.header("Access-Control-Allow-Credentials", "true");

        if (oneof && req.method == 'OPTIONS') {
            res.send(200);
        } else {
            next();
        }
    });

    var tiers = Ozone.config().getCommonProperty("deployedTiers");
    function isClientTier (tier) {
        return tier == "client";
    }

    // If this is a client-only (i.e., quasi-static HTML, CSS and JS
    // only), serve the following apps and skip the security step
    if (tiers && tiers.some(isClientTier) && tiers.every(isClientTier)) {
        app.use(require("./apps/ozone-hud")(Ozone));
        app.use(require("./apps/appsmall")(Ozone));
        standUpServer();
        return Ozone;
    };

    function standUpServer () {
        // Load additional Ozone services
        Ozone.load(__dirname, Ozone.config().getServerProperty("ozoneModules.services"));

        var imports = Ozone.config().getServerProperty("autoImport");
        if (!Ozone.Utils.isUndefinedOrNull(imports)) {
            Ozone.Service().on('ready', 'Importer', function () {
                Ozone.Service('Importer').import(imports, function(err, importResults){
                    Ozone.logger.debug(importResults);
                }, true);
            });
        }

        // Static serving
        for (var i = 0; i < Ozone.config().getServerProperty("staticPaths").length; ++i) {
            var sp = Ozone.config().getServerProperty("staticPaths")[i];
            app.use(Ozone.config().getCommonProperty("urls")[sp.urlProp], express.static(__dirname + sp.filePath));
        }

        var http = require('http');
        var https = require('https');

        var httpServer, httpsServer;

        if (!Ozone.Utils.isUndefinedOrNull(Ozone.config().getServerProperty("port"))) {
            httpServer = http.createServer(app);
            var port = Ozone.config().getClientProperty("port") || Ozone.config().getServerProperty("port");
            var host = Ozone.config().getClientProperty("host") || Ozone.config().getServerProperty("host");
            httpServer.listen(port, host, 511, function () {
                Ozone.logger.info("Ozone Container --> main.js -> starting http on port " + port);
            });
        }

        if (typeof tiers == "undefined" || (tiers.indexOf("client") != -1)) {
            app.use(require("./apps/ozone-hud")(Ozone));
            //app.use(require("./apps/appbuilder")(Ozone));
            app.use(require("./apps/appsmall")(Ozone));
        }

        if (!Ozone.Utils.isUndefinedOrNull(Ozone.config().getServerProperty("ssl.port"))) {
            var certs = {
                key: Ozone.config().getServerProperty("ssl.key"),
                ca: Ozone.config().getServerProperty("ssl.ca"),
                cert: Ozone.config().getServerProperty("ssl.cert")
            };
            httpsServer = https.createServer(certs, app);
            httpsServer.listen(Ozone.config().getServerProperty("ssl.port"), Ozone.config().getServerProperty("host"), 511, function () {
                Ozone.logger.info("Ozone Container --> main.js -> starting https on port " + Ozone.config().getServerProperty("ssl.port"));
            });
        }

        Ozone.Service("Server", {
            getHttpServer: function () {
                return httpServer;
            },
            getHttpsServer: function () {
                return httpsServer;
            }
        });
    };

    // Load security module first
    Ozone.load(__dirname, Ozone.config().getServerProperty("ozoneModules.security"));

    // Load all other modules once the security module is registered and ready
    Ozone.Service().on("ready", "Security", function () {
        standUpServer();
    });

    return Ozone;
});
