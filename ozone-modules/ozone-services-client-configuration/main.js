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

        Ozone.Routing.get("config/default.js", function (req, res) {
            res.setHeader('content-type', 'text/javascript');
            res.end(clientConfRendered);
        });
    };
}());
