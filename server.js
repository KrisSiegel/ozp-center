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

    // Load security module first
    Ozone.load(__dirname, Ozone.config().getServerProperty("ozoneModules.security"));

    // Load all other modules once the security module is registered and ready
    Ozone.Service().on("ready", "Security", function () {

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
            httpServer.listen(Ozone.config().getServerProperty("port"), Ozone.config().getServerProperty("host"), 511, function () {
                Ozone.logger.info("Ozone Container --> main.js -> starting http on port " + Ozone.config().getServerProperty("port"));
            });
        }

        app.use(require("./apps/ozone-hud")(Ozone));
        //app.use(require("./apps/appbuilder")(Ozone));
        app.use(require("./apps/appsmall")(Ozone));

        if (!Ozone.Utils.isUndefinedOrNull(Ozone.config().getServerProperty("ssl.port"))) {
            var fs = require("fs")
            var certs = { };
            if (Ozone.config().getServerProperty("ssl.key") !== undefined) {
                certs.key = fs.readFileSync(Ozone.config().getServerProperty("ssl.key"));
            }
            if (Ozone.config().getServerProperty("ssl.cert") !== undefined) {
                certs.cert = fs.readFileSync(Ozone.config().getServerProperty("ssl.cert"));
            }
            if (Ozone.config().getServerProperty("ssl.ca") !== undefined) {
                certs.ca = fs.readFileSync(Ozone.config().getServerProperty("ssl.ca"));
            }
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
    });

    return Ozone;
});
