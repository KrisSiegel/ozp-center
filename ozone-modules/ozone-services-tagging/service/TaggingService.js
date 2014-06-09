(function(){
    var containerConfigDir = '../../../config/',
        constants = require('../config/constants'),
        async = require('async'),
        store = constants.database.store.tags,
        Ozone = null,
        logger = null,
        Persistence = null;

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

                if(collection === constants.database.collection.tag && !err && results && results.length > 0){
                    var topics = {}
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
        get: function (collection, ids, callback) {
            Persistence.Store(store).Collection(collection).get(ids, function (err, result) {
                if (err) return callback(err);
                callback(err, result);
            });
        },
        query: function (collection, findParams, options, callback) {
            Persistence.Store(store).Collection(collection).query(findParams, options, function (err, result) {
                if (err) return callback(err);
                callback(err, result);
            });
        },
        delete: function (collection, ids, callback) {
            Persistence.Store(store).Collection(collection).remove(ids, function (err, result) {
                if (err) return callback(err);
                callback(err, result);
            });
        },
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
        export: function (callback) {
            this.query({}, {}, function (err, result) {
                callback.apply(this, [result]);
            });
        }
    }

    var exporting = {
        init: function (_ozone) {
            Ozone = _ozone;
            logger = Ozone.logger;
            Persistence = Ozone.Service('Persistence');
        },
        tag: {
            get: function (ids, callback) {
                _common.get(constants.database.collection.tag, ids, callback);
            },
            query: function (findParams, options, callback) {
                _common.query(constants.database.collection.tag, findParams, options, callback);
            },
            delete: function (ids, callback) {
                _common.delete(constants.database.collection.tag, ids, callback);
            },
            update: function (id, item, callback) {
                item.modified = new Date().toISOString();
                var findClause = {uri: item.uri, tag: item.tag, topic: item.topic}; //ensure uniqueness of tag
                _common.update(constants.database.collection.tag, id, item, callback, findClause);
            },
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
                        exporting.topic.create({uri: tagCreateResults[0].topic, tag: tagCreateResults[0].tag, creatorUserId: tagCreateResults[0].creatorUserId}, false, function () {
                            callback(tagCreateErr, tagCreateResults);
                        });
                    }
                });
            }
        },
        topic: {
            get: function (ids, callback) {
                _common.get(constants.database.collection.topic, ids, callback);
            },
            query: function (findParams, options, callback) {
                _common.query(constants.database.collection.topic, findParams, options, callback);
            },
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
        import: function(importData, callback){// object: { tag: [], topic: [] }, function
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
