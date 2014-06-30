/**
 *  The Tagging module handles all RESTful calls for Tag and Topic objects.
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.Tagging
 *  @class Ozone.Services.Tagging
 *  @submodule Server-Side
 *  @requires winston
 */
var winston = require('winston'),
    customLogLevels = {
       /**
        * Numerical level lookup for logging levels
        * @attribute levels {Object}
        * @private
        */
        levels: {
            debug: 0,
            info: 1,
            warning: 2,
            error: 3
        },
        /**
         * Color lookup for logging levels
         * @attribute colors {Object}
         * @private
         */
        colors: {
            debug: 'grey',
            info: 'green',
            warning: 'orange',
            error: 'red'
        }
    },
    /**
     * Creates a logger object using the Winston library, which logs at the debug level
     * @attribute logger {Object}
     */
    logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)({
            'timestamp': true,
            /*
            function() { // timestamp function
                var currentdate = new Date(); 
                var datetime = currentdate.getFullYear() + "-"
                            + ("0" + (currentdate.getMonth()+1)).slice(-2) + "-"
                            + ("0" + currentdate.getDate()).slice(-2)  
                            + " "  
                            + ("0" + currentdate.getHours()).slice(-2) + ":"  
                            + ("0" + currentdate.getMinutes()).slice(-2) + ":" 
                            + ("0" + currentdate.getSeconds()).slice(-2) + "." 
                            + currentdate.getMilliseconds();
                return datetime;
            }, */
            colorize: true, 
            level: 'debug'
        })
      ],
      levels: customLogLevels.levels,
      colors: customLogLevels.colors
  });

module.exports = logger;