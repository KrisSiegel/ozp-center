/**
    @module Ozone
    @class Ozone
*/
Ozone.extend(function () {
    var levels = {
        "debug": 0,
        "info": 1,
        "warning": 2,
        "warn": 2,
        "error": 3
    };

    var clientImpCache, serverImpCache;

    /**
        The implementation of the debug, info, warning and error methods for the client
    */
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

    /**
        The implementation of the debug, info, warning and error methods for the server
    */
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
        /**
            @method logger.debug
            @param {Object} obj an n number of parameters of various types to be logged.
        */
        debug: function () {
            callCorrectImp("debug", Ozone.utils.argumentsToArray(arguments));
        },
        /**
            @method logger.info
            @param {Object} obj an n number of parameters of various types to be logged.
        */
        info: function () {
            callCorrectImp("info", Ozone.utils.argumentsToArray(arguments));
        },
        /**
            @method logger.warning
            @param {Object} obj an n number of parameters of various types to be logged.
        */
        warning: function () {
            callCorrectImp("warning", Ozone.utils.argumentsToArray(arguments));
        },
        /**
            @method logger.warn
            @param {Object} obj an n number of parameters of various types to be logged.
        */
        warn: function () {
            callCorrectImp("warning", Ozone.utils.argumentsToArray(arguments));
        },
        /**
            @method logger.error
            @param {Object} obj an n number of parameters of various types to be logged.
        */
        error: function () {
            callCorrectImp("error", Ozone.utils.argumentsToArray(arguments));
        }
    };

    logger.info("Ozone.logger -> log level set to " + Ozone.config().getCommonProperty("logging.level"));

    return {
        logger: logger
    };
}());
