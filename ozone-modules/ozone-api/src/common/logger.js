Ozone.extend(function () {

    var levels = {
        "debug": 0,
        "info": 1,
        "warning": 2,
        "warn": 2,
        "error": 3
    };

    var clientImpCache, serverImpCache;

    var clientImp = (function () {
        return {
            debug: function (args) {
                console.log(args);
            },
            info: function (args) {
                console.info(args);
            },
            warning: function (args) {
                console.warn(args);
            },
            error: function (args) {
                console.error(args);
            }
        };
    });

    var serverImp = (function () {
        var winston = require('winston');
        var winstonColors = {
            "colors": {
                "debug": 'grey',
                "info": 'green',
                "warning": 'orange',
                "error": 'red'
            }
        };

        var wog = new (winston.Logger)({
            level: Ozone.config().getCommonProperty("logging.level"),
            levels: levels,
            colors: winstonColors.colors,
            transports: [new (winston.transports.Console)({
                level: Ozone.config().getCommonProperty("logging.level"),
                levels: levels,
                timestamp: true,
                colorize: true
            })]
        });

        return {
            debug: function (args) {
                wog.debug(args);
            },
            info: function (args) {
                wog.info(args);
            },
            warning: function (args) {
                wog.warn(args);
            },
            error: function (args) {
                wog.error(args);
            }
        };
    });

    var callCorrectImp = function (method, args) {
        if (levels[method] >= levels[Ozone.config().getCommonProperty("logging.level")]) {
            if (Ozone.utils.isClientSide()) {
                if (clientImpCache === undefined) {
                    clientImpCache = clientImp();
                }
                clientImpCache[method].apply(this, args);
            } else if (Ozone.utils.isServerSide()) {
                if (serverImpCache === undefined) {
                    serverImpCache = serverImp();
                }
                serverImpCache[method].apply(this, args);
            }
        }
    };

    var logger = {
        debug: function () {
            callCorrectImp("debug", Ozone.utils.argumentsToArray(arguments));
        },
        info: function () {
            callCorrectImp("info", Ozone.utils.argumentsToArray(arguments));
        },
        warning: function () {
            callCorrectImp("warning", Ozone.utils.argumentsToArray(arguments));
        },
        warn: function () {
            callCorrectImp("warning", Ozone.utils.argumentsToArray(arguments));
        },
        error: function () {
            callCorrectImp("error", Ozone.utils.argumentsToArray(arguments));
        }
    };

    logger.info("Ozone.logger -> log level set to " + Ozone.config().getCommonProperty("logging.level"));

    return {
        logger: logger
    };
}());
