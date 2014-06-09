
module.exports = (function (Ozone) {
    return {
        exportServices: function (services, callback) {
            var exp = { };
            if (Ozone.utils.isUndefinedOrNull(services)) {
                services = [];
                for (var service in Ozone.Service().registeredServices) {
                    if (Ozone.Service().registeredServices.hasOwnProperty(service)) {
                        if (Ozone.Service(service).export !== undefined && Ozone.utils.isFunction(Ozone.Service(service).export)) {
                            services.push(service);
                        }
                    }
                }
            }

            if (!Ozone.utils.isArray(services) && Ozone.utils.isString(services)) {
                services = [services];
            }

            var async = require("async");
            var exec = [];
            for (var i = 0; i < services.length; ++i) {
                if (Ozone.Service(services[i]) !== undefined) {
                    (function (srv) {
                        exec.push(function (cb) {
                            Ozone.Service(srv).export(function (result) {
                                exp[srv] = result;
                                cb.apply(this, [null]);
                            });
                        });
                    }(services[i]));
                }
            }

            async.parallel(exec, function (result) {
                callback.apply(this, [exp]);
            });
        }
    };
});
