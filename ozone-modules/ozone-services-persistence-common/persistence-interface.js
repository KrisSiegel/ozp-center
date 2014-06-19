/**
    The interface in which all persistence implementations needs to use. Accessible and used via Ozone.Services("PersistenceCommon")(CollectionImplementation, DriveImplementation, ObjectIDImplementation, OzoneAPI) and returns the interface with all appropriate implementations in place.

    @module Ozone.Services.PersistenceCommon
    @class Ozone.Services.PersistenceCommon.Interface
    @submodule Server-Side
*/
(function () {
    "use strict";

    var Ozone = null,
        logger = null;

    module.exports = function (collectionImp, driveImp, objectId, _ozone) {
		if (Ozone === null) {
			Ozone = _ozone;
			logger = Ozone.logger;
		}
        function ThrowNotImplemented() {
            throw "Method Not Implemented";
        }

        function executeImpMethod(imp, method, params, context) {
            if (!Ozone.Utils.isUndefinedOrNull(imp) && !Ozone.Utils.isUndefinedOrNull(method) && !Ozone.Utils.isUndefinedOrNull(imp[method])) {
                return imp[method].apply((context || this), params);
            } else {
                ThrowNotImplemented();
            }
        }

        function isImplemented(imp, method) {
        	return imp.hasOwnProperty(method) && Ozone.Utils.isFunction(imp[method]);
        }

        return {
            /**
                Returns a valid object ID specific to the current storage system being used. For example the mock datastore returns a random number.

                @method objectId
            */
            objectId: function () {
                return executeImpMethod(objectId, "getObjectId", undefined, this);
            },
            /**
                The Store method starts the chain for accessing data and blobs; it accepts a name to use as a store which can be thought of as a database.

                @method Store
                @param {String} store the store name to use.
            */
            Store: function (store) {
                return {
                    /**
                        Collection branches off of a specific store and can be thought of as a "table" in some sense; it is a bucket for data to live in.

                        @method Store(store).Collection
                        @param {String} collection the name of the collection to use.
                    */
                    Collection: function (collection) {
                        return {
                            /**
                                In the case of extreme exceptions (and this really should be that type of case) sometimes it's helful to check whether a method is implemented or not by the underlying store. This method will test the function passed in and verify whether it's implemented or not.

                                @method Store(store).Collection(collection).isImplemented
                                @param {String} method the name of the method to test.
                            */
                        	isImplemented: function (method) {
                        		var hasMethod = isImplemented(collectionImp, method);

                            	logger.debug("persistence-interface-->Collection.isImplemented-->collectionImp." + method + ": " + hasMethod);
                            	return hasMethod;
                            },
                            /**
                                Takes a key and returns the object in the callback.

                                @method Store(store).Collection(collection).get
                                @param {String} key the id of the value to fetch.
                                @param {Function} callback with the get result.
                            */
                            get: function (key, callback) {
                                var params = [].concat(store, collection);
                                // for cases when only the callback is passed in here; for "get all"
                                if (callback === undefined) {
                                    logger.debug("persistence-interface-->Collection.get-->callback is undefined, setting key as the callback.");
                                    callback = key;
                                    params.push(null);
                                } else if (key === undefined) {
                                	params.push(null);
                                } else {
                                    var keys = key;
                                    if (!Ozone.Utils.isArray(key)) {
                                        keys = [key];
                                    }
                                    params.push(keys);
                                }

                                if (!Ozone.Utils.isFunction(callback)) {
                                	throw "No callback defined";
                                }
                                params.push(callback);

                                return executeImpMethod(collectionImp, "get", params, this);
                            },
                            /**
                                Takes a selector, options (if available) and returns the result in the callback

                                @method Store(store).Collection(collection).query
                                @param {Object} selector an object that contains all selectors to be used.
                                @param {Object} options options to be used with the query.
                                @param {Function} callback with the query result.
                            */
                            query: function (selector, options, callback) {
                            	if (!Ozone.Utils.isObject(selector)) {
                                	throw "No selector defined";
                                }

                                var params = [].concat(store, collection);
                                params.push(selector);
                                if (callback === undefined) {
                                    logger.debug("persistence-interface-->Collection.query-->callback is undefined, setting options as the callback.");
                                    callback = options;
                                    params.push(null);
                                } else {
                                    params.push(options);
                                }

                                if (!Ozone.Utils.isFunction(callback)) {
                                	throw "No callback defined";
                                }
                                params.push(callback);

                                return executeImpMethod(collectionImp, "query", params, this);
                            },
                            /**
                                Identical to the aggregate method in the MongoDB drive; meant to provide a means to aggregate results.

                                @method Store(store).Collection(collection).aggregate
                                @param {Array} aggregationArray The array of items to aggregate.
                                @param {Function} callback with the aggregation result.
                            */
                            aggregate: function (aggregationArray, callback) {
                            	if (!Ozone.Utils.isArray(aggregationArray)) {
                                	throw "No aggregationArray defined";
                                }
                            	if (!Ozone.Utils.isFunction(callback)) {
                                    throw "No callback defined";
                                }

                                var params = [].concat(store, collection);
                                params.push(aggregationArray);
                                params.push(callback);

                                return executeImpMethod(collectionImp, "aggregate", params, this);
                            },
                            /**
                                Takes a key and value and sets the data within the database with errors being reported via the callback.

                                @method Store(store).Collection(collection).set
                                @param {String} key the name of the method to test.
                                @param {Object} value the value to set.
                                @param {Function} callback containing any errors or status codes.
                            */
                            set: function (key, value, callback) {
                                var params = [].concat(store, collection);
                                params.push(key);
                                if (callback === undefined && Ozone.Utils.isArray(key)) { // for when we are passing in an array of id, obj
                                    logger.debug("persistence-interface-->Collection.set-->callback is undefined, setting value as the callback.");
                                    callback = value;
                                    params.push(null);
                                } else {
                                    params.push(value);
                                }

                                if (!Ozone.Utils.isFunction(callback)) {
                                    throw "No callback defined";
                                }
                                params.push(callback);

                                return executeImpMethod(collectionImp, "set", params, this);
                            },
                            /**
                                Takes a key and deletes the object.

                                @method Store(store).Collection(collection).remove
                                @param {String} key the name of the method to test.
                                @param {Function} callback to return the result.
                            */
                            remove: function (key, callback) {
                            	if (!Ozone.Utils.isFunction(callback)) {
                                    throw "No callback defined";
                                }
                            	if (Ozone.Utils.isUndefinedOrNull(key)) {
                                    throw "No key defined";
                                }

                                var params = [].concat(store, collection);
                                var keys = key;
                                if (!Ozone.Utils.isArray(key)) {
                                    keys = [key];
                                }
                                params.push(keys);
                                params.push(callback);

                                return executeImpMethod(collectionImp, "remove", params, this);
                            },
                            /**
                                Adds an index.

                                @method Store(store).Collection(collection).addIndex
                                @param {Object} index the index to apply
                                @param {Object} options any options to apply to the index
                                @param {Function} callback to return the result.
                            */
                            addIndex: function (index, options, callback) {
                            	if (Ozone.Utils.isUndefinedOrNull(index)) {
                                    throw "No index defined";
                                }

                                var params = [].concat(store, collection);
                                params.push(index);
                                if (callback === undefined) {
                                    logger.debug("persistence-interface-->Collection.addIndex-->callback is undefined, setting options as the callback.");
                                    callback = options;
                                    params.push(null);
                                } else {
                                    params.push(options);
                                }

                                if (!Ozone.Utils.isFunction(callback)) {
                                    throw "No callback defined";
                                }
                                params.push(callback);

                                return executeImpMethod(collectionImp, "addIndex", params, this);
                            },
                            /**
                                Gets all indexes and returns in the callback.

                                @method Store(store).Collection(collection).getIndexes
                                @param {Function} callback to return the result.
                            */
                            getIndexes: function (callback) {
                            	if (!Ozone.Utils.isFunction(callback)) {
                                    throw "No callback defined";
                                }

                                var params = [].concat(store, collection, callback);

                                return executeImpMethod(collectionImp, "getIndexes", params, this);
                            },
                            /**
                                Removes an index.

                                @method Store(store).Collection(collection).removeIndex
                                @param {Object} index the index to remove.
                                @param {Function} callback to return the result.
                            */
                            removeIndex: function (index, callback) {
                            	if (!Ozone.Utils.isFunction(callback)) {
                                    throw "No callback defined";
                                }
                            	if (Ozone.Utils.isUndefinedOrNull(index)) {
                                    throw "No index defined";
                                }

                                var params = [].concat(store, collection, index, callback);

                                return executeImpMethod(collectionImp, "removeIndex", params, this);
                            },
                            /**
                                Removes all indexes. NOTE: This should probably never be used outside of testing or development.

                                @method Store(store).Collection(collection).removeAllIndexes
                                @param {Function} callback to return the result.
                            */
                            removeAllIndexes: function (callback) {
                            	if (!Ozone.Utils.isFunction(callback)) {
                                    throw "No callback defined";
                                }

                                var params = [].concat(store, collection, callback);

                                return executeImpMethod(collectionImp, "removeAllIndexes", params, this);
                            }
                        };
                    },
                    /**
                        Takes a string to name a specific drive in which blob data will be stored.

                        @method Store(store).Drive
                        @param {String} drive the name of the 'drive' to use for storing blobs.
                    */
                    Drive: function (drive) {
                        return {
                            /**
                                In the case of extreme exceptions (and this really should be that type of case) sometimes it's helful to check whether a method is implemented or not by the underlying store. This method will test the function passed in and verify whether it's implemented or not.

                                @method Store(store).Drive(drive).isImplemented
                                @param {String} method the name of the method to test.
                            */
                        	isImplemented: function (method) {
                        		var hasMethod = isImplemented(driveImp, method);

                            	logger.debug("persistence-interface-->Drive.isImplemented-->driveImp." + method + ": " + hasMethod);
                            	return hasMethod;
                            },
                            /**
                                Takes a key and returns the blob in the callback.

                                @method Store(store).Drive(drive).get
                                @param {String} key the blobs's id to fetch
                                @param {Function} callback with the get result.
                            */
                            get: function (key, callback) {
                                var params = [].concat(store, drive);
                                if (callback === undefined) {
                                    logger.debug("persistence-interface-->Drive.get-->callback is undefined, setting key as the callback.");
                                    callback = key;
                                    params.push(null);
                                } else if (key === undefined) {
                                	params.push(null);
                                } else {
                                    var keys = key;
                                    if (!Ozone.Utils.isArray(key)) {
                                        keys = [key];
                                    }
                                    params.push(keys);
                                }

                                if (!Ozone.Utils.isFunction(callback)) {
                                    throw "No callback defined";
                                }
                                params.push(callback);

                                return executeImpMethod(driveImp, "get", params, this);
                            },
                            /**
                                Takes a key and value and sets the blob within the database with errors being reported via the callback.

                                @method Store(store).Drive(drive).set
                                @param {String} key the name of the method to test.
                                @param {Object} value the blob to set.
                                @param {Function} callback containing any errors or status codes.
                            */
                            set: function (key, blob, callback) {
                                var params = [].concat(store, drive);
                                params.push(key);
                                if (callback === undefined && Ozone.Utils.isArray(key)) { // for when we are passing in an array of id, obj
                                    logger.debug("persistence-interface-->Drive.set-->callback is undefined, setting value as the callback.");
                                    callback = blob;
                                    params.push(null);
                                } else {
                                    params.push(blob);
                                }

                                if (!Ozone.Utils.isFunction(callback)) {
                                    throw "No callback defined";
                                }
                                params.push(callback);

                                return executeImpMethod(driveImp, "set", params, this);
                            },
                            /**
                                Takes a key and deletes the blob.

                                @method Store(store).Drive(drive).remove
                                @param {String} key the name of the method to test.
                                @param {Function} callback to return the result.
                            */
                            remove: function (key, callback) {
                            	if (!Ozone.Utils.isFunction(callback)) {
                                    throw "No callback defined";
                                }
                            	if (Ozone.Utils.isUndefinedOrNull(key)) {
                                    throw "No key defined";
                                }
                                var params = [].concat(store, drive);
                                var keys = key;
                                if (!Ozone.Utils.isArray(key)) {
                                    keys = [key];
                                }
                                params.push(keys);
                                params.push(callback);

                                return executeImpMethod(driveImp, "remove", params, this);
                            }
                        };
                    }
                };
            }
        };
    };
}());
