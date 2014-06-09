Ozone.extend(function () {

    return {
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
