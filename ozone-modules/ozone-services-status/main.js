(function () {
    module.exports = function (callback, Ozone) {
        var status = require("./status")(Ozone);
        Ozone.Routing.get("status", { loggedIn: false }, function (req, res, next) {
            status.registeredServices = [];
            for (var key in Ozone.Service().registeredServices) {
                if (Ozone.Service().registeredServices.hasOwnProperty(key)) {
                    status.registeredServices.push(key);
                }
            }
            res.send(status);
        });

        if (Ozone.config().getServerProperty("serveFullConfigToSysAdmins") === true) {
            Ozone.Routing.get("status/config", { loggedIn: true, permissions: ["/Ozone/System/Administration/"] }, function (req, res, next) {
                res.setHeader('content-type', 'text/javascript');
                res.send(JSON.stringify(Ozone.config().getConfig(), null, 4));
            });
        }
    };
}());
