module.exports = (function (Ozone) {
    var status = {
        state: "Starting"
    };

    Ozone.Service().on("ready", "Server", function () {
        status.state = "Started";
        status.server = {
            host: Ozone.config().getServerProperty("host"),
            port: Ozone.config().getServerProperty("port"),
            apiBasePath: Ozone.config().getServerProperty("apiBasePath")
        };
        status.client = {
            servicesUrl: Ozone.config().getClientProperty("servicesUrl"),
            amlUrl: Ozone.config().getClientProperty("amlUrl"),
            hudUrl: Ozone.config().getClientProperty("hudUrl"),
            appBuilderUrl: Ozone.config().getClientProperty("appBuilderUrl")
        };
    });

    var updateModuleStatus = function (module, service) {
        Ozone.Service().on("ready", service, function () {
            for (var i = 0; i < status.ozoneModules.length; ++i) {
                if (status.ozoneModules[i].module === module) {
                    status.ozoneModules[i].status = "Started";
                    break;
                }
            }
        });
    };

    status.ozoneModules = Ozone.config().getServerProperty("ozoneModules.services");
    status.ozoneModules.push(Ozone.config().getServerProperty("ozoneModules.security"));
    for (var i = 0; i < status.ozoneModules.length; ++i) {
        if (status.ozoneModules[i].services.length > 0) {
            for (var j = 0; j < status.ozoneModules[i].services.length; ++j) {
                updateModuleStatus(status.ozoneModules[i].module, status.ozoneModules[i].services[j]);
            }
        } else {
            status.ozoneModules[i].status = "Presumed";
        }
    }

    return status;
});
