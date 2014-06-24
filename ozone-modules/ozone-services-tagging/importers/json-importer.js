/**
 *  The Tagging module handles all RESTful calls for Tag and Topic objects.
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.Tagging
 *  @class Ozone.Services.Tagging
 *  @submodule Server-Side
 */
var Ozone = null,
    logger = null,
    path = require('path');


module.exports = function (target, _ozone) {
    Ozone = _ozone;
    logger = Ozone.logger;
    return {
        /**
         * 
         * @method getName
         * @return {String} 
         */
        getName: function() {
            return path.basename(__filename);
        },
        /**
         * 
         * @method canProcess
         * @param data {Object}
         * @return {Boolean} 
         */
        canProcess: function(data) {
            logger.debug("TaggingService-->importers-->tag-json-->in canProcess()");
            return Ozone.Utils.isObject(data);
        },
        /**
         * 
         * @method process
         * @param data {Object}
         * @param callback {Function}
         */
        process: function(data, callback) {
            logger.debug("TaggingService-->importers-->tag-json-->in process()");
        
            this.insertItems(data.injectableRecords, callback);
        },
        /**
         * 
         * @method insertItems
         * @param injectableRecords {Object}
         * @param callback {Function}
         */
        insertItems: function(injectableRecords, callback) {
            var thingsToInsert = [],
                Persistence = Ozone.Service("Persistence");
        
            for (var i = 0; i < injectableRecords.length; i++) {
                var obj = {
                        'null': injectableRecords[i]
                    };
            
                thingsToInsert.push(obj);
            }
        
            Persistence.Store(target.store).Collection(target.collection).set(thingsToInsert, function(err, result) {
                if (err) {
                    return callback(err);
                }
                callback(null, result);
            });
        }
    }
};
