/**
    @module Ozone.Services
    @class Ozone.Services.Exporter
    @submodule Client-Side
*/
Ozone.Service("Exporter", (function () {
    var service = {
        /**
            Gets the service path

            @method getServicePath
        */
        getServicePath: function () {
            return Ozone.utils.murl("apiBaseUrl", "/exporter/", true);
        },
        /**
            @method exportService
            @param {Array} services the services to export
            @param {Method} callback the callback to execute upon completion
        */
        exportService: function (services, callback, context) {
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

            Ozone.ajax({
                method: "GET",
                query: {
                    service: services
                },
                url: service.getServicePath(),
                success: function (status, response) {
                    console.log(response);
                },
                error: function (status, response) {

                },
                context: (context || this)
            });
        }
    };

    return service;
}()));
