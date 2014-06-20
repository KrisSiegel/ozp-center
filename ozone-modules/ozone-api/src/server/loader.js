/**
    @module Ozone
    @submodule Server-Side
    @class Ozone
*/
Ozone.extend(function () {
    return {
        /**
            Loads the specified Ozone Modules and passes in the Ozone API to each module.

            @method Ozone.load
            @param {String} appBasePath the base path of the service container itself.
            @param {Array} modules an array of modules to load.
        */
        load: function (appBasePath, modules) {
            // Load ozone modules
            if (!Ozone.utils.isUndefinedOrNull(modules)) {
                if (!Ozone.utils.isArray(modules)) {
                    modules = [modules];
                }
                if (modules.length > 0) {
                    var path = require("path");
                    for (var i = 0; i < modules.length; ++i) {
                        if (modules[i].require !== false) {
                            Ozone.logger.info("Ozone API -> loader -> load() -> loading ozone module " + modules[i].module);
                            require(path.join(appBasePath, "./ozone-modules/" + modules[i].module))(function () {}, Ozone);
                        }
                    }
                }
            }
        }
    };
}());
