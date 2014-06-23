/**
 *  The Import/Export module performs JSON serialization and deserialization of all module data and metadata
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.ImportExport
 *  @class Ozone.Services.ImportExport
 *  @submodule Server-Side
 *  @requires async
 */
module.exports = (function (Ozone) {
    return {
        /**
         * @method exportServices
         * @param services {Array} An array of Ozone service names, where all services in this list will be exported.
         * @param callback {Function} a function that gets invoked after all services have been exported.  An object containing 
         *        all export results (one key-value pair per service) will get passed into the callback function.
         */
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
