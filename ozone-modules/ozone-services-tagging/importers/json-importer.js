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
         * Get the base path for import/export
         * @method getName
         * @return {String} the base path for import/export
         */
        getName: function() {
            return path.basename(__filename);
        },
        /**
         * Checks if the data object passed in can be processed.
         * @method canProcess
         * @param data {Object} the data object
         * @return {Boolean} True if data object passed in can be processed.
         */
        canProcess: function(data) {
            logger.debug("TaggingService-->importers-->tag-json-->in canProcess()");
            return Ozone.Utils.isObject(data);
        },
        /**
         * Processes root-level Tagging record object
         * @method process
         * @param data {Object} root-level Tagging record object that contains an injectableRecords field
         * @param callback {Function} called after Tag objects have been processed
         */
        process: function(data, callback) {
            logger.debug("TaggingService-->importers-->tag-json-->in process()");
        
            this.insertItems(data.injectableRecords, callback);
        },
        /**
         * Inserts many Tag objects via Ozone Persistence layer
         * @method insertItems
         * @param injectableRecords {Array} an array of Tag objects to be inserted via Ozone Persistence layer
         * @param callback {Function} called after Tag objects have been processed
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
