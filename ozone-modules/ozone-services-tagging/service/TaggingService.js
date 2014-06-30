/**
 *  The Tagging module handles all RESTful calls for Tag and Topic objects.
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.Tagging
 *  @class Ozone.Services.Tagging
 *  @submodule Server-Side
 */
(function(){
    var containerConfigDir = '../../../config/',
        constants = require('../config/constants'),
        async = require('async'),
        store = constants.database.store.tags,
        Ozone = null,
        logger = null,
        Persistence = null;

    /**
     *
     * @method importRecords
     * @param filePathArray {Array} array of local filenames, from config directory
     * @param configDir {String} directory where files are stored
     * @param callback {Function} called after all files have been imported; the error status is passed into this function when invoked.
     * @param collection {String} name of Persistence collection where import records will be stored
     * @private
     */
    var importRecords = function(filePathArray, configDir, callback, collection) {
        var configDir = configDir || containerConfigDir;

        for (var i = 0; i < filePathArray.length; i++) {
            var filePath = __dirname + '/' + configDir + filePathArray[i],
                data;

            logger.debug("Import-->filePath: " + filePath);

            // currently only supporting json files
            data = require(filePath);

            require('../routes/importHelper')(data, {
                store: store,
                collection: collection
            }, function(err, results) {
                if (err) {
                    logger.error("Import-->error while importing: " + err);
                } else {
                    logger.info("Import-->successfully imported: " + filePath);
                }

                if((collection === constants.database.collection.tag) && !err && results && (results.length > 0)) {
                    var topics = {};
                    for(var index = 0; index < results.length; index++){
                        var tag = results[index];
                        if(!topics[tag.topic + tag.tag]){
                            topics[tag.topic + tag.tag] = {uri: tag.topic, tag: tag.tag};
                            //try to create topic, if already exists, create function will not create a new one.
                            _common.create(constants.database.collection.topic, topics[tag.topic + tag.tag], false,topics[tag.topic + tag.tag], function(err, res){});
                        }
                    }
                }

                if (Ozone.Utils.isFunction(callback)) {
                    callback(err);
                }
            }, Ozone);
        }
    };

    var _common = {
        /**
         * Retrieve a list of objects in Persistence from the collection passed, where the object ids are equal to the id values passed in.
         * @method common.get
         * @param collection {String} name of Persistence collection name
         * @param ids {Array} id fields of all records to retrieve from database
         * @param callback {Function} method called after GET request has been completed.
         *        Standard (err, result) Express parameters get passed into this function.
         * @private
         */
        get: function (collection, ids, callback) {
            Persistence.Store(store).Collection(collection).get(ids, function (err, result) {
                if (err) return callback(err);
                callback(err, result);
            });
        },
        /**
         * Queries on a Persistence collection and passed the query results into the callback passed in.
         * @method common.query
         * @param collection {String} name of Persistence collection name
         * @param findParams {Object} query parameters for finding records
         * @param options {Object} query options
         * @param callback {Function} method called after query has been completed.
         *        Standard (err, result) Express parameters get passed into this function.
         * @private
         */
        query: function (collection, findParams, options, callback) {
            Persistence.Store(store).Collection(collection).query(findParams, options, function (err, result) {
                if (err) return callback(err);
                callback(err, result);
            });
        },
        /**
         * Deletes objects with ids equal to the values passed in from the specified Persistence collection
         * @method common.delete
         * @param collection {String} name of Persistence collection name
         * @param ids {Array} ids of the records to be deleted
         * @param callback {Function} method called after DELETE request has been completed.
         *        Standard (err, result) Express parameters get passed into this function.
         * @private
         */
        delete: function (collection, ids, callback) {
            Persistence.Store(store).Collection(collection).remove(ids, function (err, result) {
                if (err) return callback(err);
                callback(err, result);
            });
        },
        /**
         * Updates a single object in Persistence from the collection passed, with id equal to the value passed in.
         * @method common.update
         * @param collection {String} name of Persistence collection name
         * @param id {String} id of record to be updated
         * @param item {Object} data object that will replace previous object on update
         * @param callback {Function} method called after PUT request has been completed.
         *        Standard (err, result) Express parameters get passed into this function.
         * @param uniqueClause {Boolean} If True, then object will only be updated if collection objects remain unique
         * @private
         */
        update: function (collection, id, item, callback, uniqueClause) {
            if(uniqueClause){
                Persistence.Store(store).Collection(collection).query(uniqueClause, null, function (findErr, tags) {
                    if (findErr)
                        return callback(findErr);
                    else if (tags && tags.length > 0)
                        return callback("Tags must be unique.");
                    else
                        Persistence.Store(store).Collection(collection).set(id, item, function (err, result) {
                            if (err) return callback(err);
                            callback(err, result);
                        });
                });
            }
            else{
                Persistence.Store(store).Collection(collection).set(id, item, function (err, result) {
                    if (err) return callback(err);
                    callback(err, result);
                });
            }
        },
        /**
         * Updates a single object in Persistence from the collection passed, with id equal to the value passed in.
         * @method common.create
         * @param collection {String} name of Persistence collection name
         * @param item {Object} The data object to be created
         * @param overwriteExisting {Boolean} An existing record with matching id will only get overwritten if this value is truthy
         * @param uniqueClause {Boolean} If True, then object will only be updated if collection objects remain unique
         * @param callback {Function} method called after GET request has been completed.
         *        Standard (err, result) Express parameters get passed into this function.
         * @private
         */
        create: function (collection, item, overwriteExisting, uniqueClause, callback) {
            if(uniqueClause){
                Persistence.Store(store).Collection(collection).query(uniqueClause, null, function (findErr, tags) {
                    if (findErr){
                        return callback(findErr);
                    }
                    else if (tags && tags.length > 0){
                        if(overwriteExisting){
                            _common.delete(collection, tags[0]._id, function(err){
                                if (err) return callback(err);
                                Persistence.Store(store).Collection(collection).set(null, item, function (err, result) {
                                    if (err) return callback(err);
                                    callback(err, result);
                                });
                            });
                        }else{
                            return callback("Tags must be unique.");
                        }
                    }
                    else
                        Persistence.Store(store).Collection(collection).set(null, item, function (err, result) {
                            if (err) return callback(err);
                            callback(err, result);
                        });
                });
            } else {
                Persistence.Store(store).Collection(collection).set(null, item, function (err, result) {
                    if (err) return callback(err);
                    callback(err, result);
                });
            }
        },
        /**
         * Loads all files in file path array and saves data into collection
         * @method common.import
         * @param collection {String} name of Persistence collection where import records will be stored
         * @param filePathArray {Array} array of local filenames, from config directory
         * @param configDir {String} directory where files are stored
         * @param callback {Function} called after all files have been imported; the error status is passed into this function when invoked.
         * @private
         */
        import: function(collection, filePathArray, configDir, callback) {
            logger.debug("Importing " + collection + " into " + store);

            if (Ozone.Utils.isUndefinedOrNull(callback)) {
                callback = configDir;
            }

            // see if we need to import - check if collection is empty.
            Persistence.Store(store).Collection(collection).get(function(err, results) {
                if (err) {
                    logger.error("Import-->got error while getting " + collection + ": " + err);
                    if (Ozone.Utils.isFunction(callback)) {
                        callback(err);
                    } else {
                        return;
                    }
                }

                if (results.length === 0) {
                    logger.info("Import-->we don't have any " + collection + " records, so proceed with import.");
                    importRecords(filePathArray, configDir, callback, collection);
                } else {
                    logger.info("Import-->we already have " +
                        results.length + " " + collection +
                        " records, so not importing.");
                    if (Ozone.Utils.isFunction(callback)) {
                        callback();
                    }
                }
            });
        },
        /**
         * Retrieves all records and invokes callback on results
         * @method common.export
         * @param callback {Function} method called after export has been completed.
         *        Standard (err, result) Express parameters get passed into this function.
         * @private
         */
        export: function (callback) {
            this.query({}, {}, function (err, result) {
                callback.apply(this, [result]);
            });
        }
    }

    var exporting = {
        /**
         * Initializing Ozone service and logger
         * @method init
         */
        init: function (_ozone) {
            Ozone = _ozone;
            logger = Ozone.logger;
            Persistence = Ozone.Service('Persistence');
        },
        tag: {
            /**
             * Retrieve Tag objects with ids matching the values passed in
             * @method tag.get
             * @param ids {Array} a list of Tag object ids to search for.
             * @param callback {Function} method called after getting data; Tag object results are passed in as an array.
             */
            get: function (ids, callback) {
                _common.get(constants.database.collection.tag, ids, callback);
            },
            /**
             * Search for Tag objects based on query parameters passed in
             * @param findParams {Object} a list of Tag object ids to search for.
             * @param options {Object} a list of Tag object ids to search for.
             * @param callback {Function} method called after querying for Tag records; results are passed in as an array.
             * @method tag.query
             */
            query: function (findParams, options, callback) {
                _common.query(constants.database.collection.tag, findParams, options, callback);
            },
            /**
             * Delete Tag objects with ids matching the values passed in
             * @method tag.delete
             * @param ids {Array} a list of Tag object ids to delete.
             * @param callback {Function} method called after deleting Tags.
             */
            delete: function (ids, callback) {
                _common.delete(constants.database.collection.tag, ids, callback);
            },
            /**
             * Save the Tag object passed in to persistence, with the id passed in.
             * @method tag.update
             * @param id {Object} id of the Tag object to update
             * @param item {Object} the Tag object to update
             * @param callback {Function} method called after saving Tag record; updated Tag object is passed in as the lone parameter when invoked.
             */
            update: function (id, item, callback) {
                item.modified = new Date().toISOString();
                var findClause = {uri: item.uri, tag: item.tag, topic: item.topic}; //ensure uniqueness of tag
                _common.update(constants.database.collection.tag, id, item, callback, findClause);
            },
            /**
             * Save the Tag object passed in to persistence, with the id passed in.
             * @method tag.create
             * @param id {Object} id of the Tag object to update
             * @param item {Object} the Tag object to update
             * @param callback {Function} method called after saving Tag record; updated Tag object is passed in as the lone parameter when invoked.
             */
            create: function (item, overwriteExisting, callback, skipTopicCheck) {// function (item, callback)
                if(!callback){
                    callback = overwriteExisting; //overwriteExisting is optional
                    overwriteExisting = false;
                }
                var findClause = {uri: item.uri, tag: item.tag, topic: item.topic}; //ensure uniqueness of tag
                item.created = item.modified = new Date().toISOString();
                _common.create(constants.database.collection.tag, item, overwriteExisting, findClause, function(tagCreateErr, tagCreateResults){
                    if(skipTopicCheck){
                        callback(tagCreateErr, tagCreateResults);
                    } else {
                        if (tagCreateResults !== undefined && tagCreateResults.length > 0) {
                            exporting.topic.create({uri: tagCreateResults[0].topic, tag: tagCreateResults[0].tag, creatorUserId: tagCreateResults[0].creatorUserId}, false, function () {
                                callback(tagCreateErr, tagCreateResults);
                            });
                        }
                    }
                });
            }
        },
        topic: {
            /**
             * Retrieve Topic objects with ids matching the values passed in
             * @method topic.get
             * @param ids {Array} a list of Topic object ids to search for.
             * @param callback {Function} method called after getting data; Topic object results are passed in as an array.
             */
            get: function (ids, callback) {
                _common.get(constants.database.collection.topic, ids, callback);
            },
            /**
             * Search for Topic objects based on query parameters passed in
             * @param findParams {Object} a list of Topic object ids to search for.
             * @param options {Object} a list of Topic object ids to search for.
             * @param callback {Function} method called after querying for Topic records; results are passed in as an array.
             * @method topic.query
             */
            query: function (findParams, options, callback) {
                _common.query(constants.database.collection.topic, findParams, options, callback);
            },
            /**
             * Delete Topic objects with ids matching the values passed in
             * @method topic.delete
             * @param ids {Array} a list of Topic object ids to delete.
             * @param callback {Function} method called after deleting Topics.
             */
            delete: function (ids, callback) {
                _common.get(constants.database.collection.topic, ids, function(err, result){
                    if (err) return callback(err);
                    //delete tags associated to topics
                    for(var index = 0; index < result.length; index ++){
                        _common.query(constants.database.collection.tag, {tag: result[index].tag, topic: result[index].uri}, {}, function(err, result){
                            _common.delete(constants.database.collection.tag, result.map(function(tagResult){return tagResult._id}), function(){});
                        });
                    }
                    //delete topic
                    _common.delete(constants.database.collection.topic, ids, callback);
                });
            },
            /**
             * Save the Topic object passed in to persistence, with the id passed in.
             * @method topic.update
             * @param id {Object} id of the Topic object to update
             * @param item {Object} the Topic object to update
             * @param callback {Function} method called after saving Topic record; updated Topic object is passed in as the lone parameter when invoked.
             */
            update: function (id, item, callback) {
                var findClause = {uri: item.uri, tag: item.tag}; //ensures uniqueness for topic
                _common.query(constants.database.collection.topic, findClause, {}, function(err, results){
                    if (err) return callback(err);
                    else if(results && results.length > 0 && results[0]._id.toString() !== id.toString()) return callback("Topics must be unique");
                    else
                        _common.get(constants.database.collection.topic, id, function(err, topics){
                            if (err) return callback(err);
                            if (topics.length !== 0 && topics[0].tag !== item.tag) {
                                //update tags first to reflect topics change in tag name
                                _common.query(constants.database.collection.tag, {topic: item.uri, tag: topics[0].tag}, {}, function(err, tagResults){
                                    for(var index = 0; index < tagResults.length; index++){
                                        tagResults[index].tag = item.tag;
                                        _common.update(constants.database.collection.tag, tagResults[index]._id, tagResults[index], function(){});
                                    }
                                });
                            }
                            //update topic
                            item.modified = new Date().toISOString();
                            _common.update(constants.database.collection.topic, id, item, callback);
                        });
                });
            },
            /**
             * Create a new Topic object with the item fields passed in and a generated ID.
             * @param item {Object} the Topic object to create
             * @param overwriteExisting {Boolean} An existing record with matching id will only get overwritten if this value is truthy.
             * @param callback {Function} method called after creating Topic record; new Topic object with generated id is passed in as the lone parameter when invoked.
             * @method topic.create
             */
            create: function (item, overwriteExisting, callback) {// function (item, callback)
                if(!callback){
                    callback = overwriteExisting || function(){}; //overwriteExisting is optional
                    overwriteExisting = false;
                }
                var findClause = {uri: item.uri, tag: item.tag}; //ensures uniqueness for topic
                item.created = item.modified = new Date().toISOString();
                _common.create(constants.database.collection.topic, item, overwriteExisting, findClause, callback);
            }
        },
        /**
         * Imports tag or topic data from data object
         * @method import
         * @param importData {Object} contains tag and/or topic data in the format {```tag: [], topic: []```}
         * @param callback {Function} method called after importing.
         */
        import: function(importData, callback, path, autoImporting){
            var importReport = { tag: { successful: 0, failed: 0 }, topic: { successful: 0, failed: 0 } }
            var importTags = function(){
                if(importData['tag'] && importData['tag'].length > 0){
                    var topicList = {};
                    async.parallel( importData['tag'].map(function(tag){
                        return function(callback){
                            if(!topicList[tag.topic + tag.tag]){
                                topicList[tag.topic + tag.tag] = {tag: tag.tag, uri: tag.topic, creatorUserId: 'System'}
                            }
                            exporting.tag.create(tag, true, function (err) {
                                if (err) {
                                     importReport.tag.failed ++;
                                } else {
                                    importReport.tag.successful ++;
                                }
                                if(callback){
                                    callback();
                                }
                            }, true);
                        }
                    }), function(){ //create topics if they do not exist for imported tags, separated from tag creation due to timing issues could cause duplicated topics created
                        async.parallel( Object.keys(topicList).map(function(topicKey){return function(callback){
                                exporting.topic.create(topicList[topicKey], false, function(err){
                                    if (err){
                                        if(err !== "Tags must be unique.") {//it is not considered a failed or successful import at this point if it comes back as failed because non-unique
                                            importReport.topic.failed++;
                                        }
                                    } else {
                                        importReport.topic.successful ++;
                                    }
                                    if(callback){
                                        callback();
                                    }
                                });
                            }}), function(){
                                if(callback){
                                    callback(importReport);
                                }
                            });
                    });
                } else if(callback){
                    callback(importReport);
                }
            };
            if(importData['topic'] && importData['topic'].length > 0){
                async.parallel( importData['topic'].map( function(topic){
                    return function(callback) {
                        exporting.topic.create(topic, true, function (err) {
                            if (err) {
                                importReport.topic.failed ++;
                            } else {
                                importReport.topic.successful ++;
                            }
                            if(callback){
                                callback();
                            }
                        });
                    }
                }), function(){
                    importTags();
                } );
            } else {
                importTags();
            }
        },
        /**
         * Queries tag or topic data from database, and passes results into callback in the format {```tag: [], topic: []```}
         * @method export
         * @param callback {Function} method called after retrieving data
         */
        export: function(callback){
            var exportData = {}
            async.parallel([function(callback){
                exporting.tag.query({},{}, function(err, res){
                    if(err){
                        throw err;
                    }
                    exportData['tag'] = res;
                    if(callback){
                        callback();
                    }
                });
            }, function(callback){
                exporting.topic.query({},{}, function(err, res){
                    if(err){
                        throw err;
                    }
                    exportData['topic'] = res;
                    if(callback){
                        callback();
                    }
                });
            }], function(){
                if(callback){
                    callback(exportData);
                } else {
                    throw "No callback was given for tags export.";
                }
            });
        }
    }
    module.exports = exporting;
}());
