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
            objectId: function () {
                return executeImpMethod(objectId, "getObjectId", undefined, this);
            },
            Store: function (store) {
                return {
                    Collection: function (collection) {
                        return {
                        	isImplemented: function (method) {
                        		var hasMethod = isImplemented(collectionImp, method);
                        		
                            	logger.debug("persistence-interface-->Collection.isImplemented-->collectionImp." + method + ": " + hasMethod);
                            	return hasMethod;
                            },
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
                            getIndexes: function (callback) {
                            	if (!Ozone.Utils.isFunction(callback)) {  
                                    throw "No callback defined";
                                } 
                            	
                                var params = [].concat(store, collection, callback);

                                return executeImpMethod(collectionImp, "getIndexes", params, this);
                            },
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
                            removeAllIndexes: function (callback) {
                            	if (!Ozone.Utils.isFunction(callback)) {  
                                    throw "No callback defined";
                                } 
                            	
                                var params = [].concat(store, collection, callback);

                                return executeImpMethod(collectionImp, "removeAllIndexes", params, this);
                            }
                        };
                    },
                    Drive: function (drive) {
                        return {
                        	isImplemented: function (method) {
                        		var hasMethod = isImplemented(driveImp, method);
                        		
                            	logger.debug("persistence-interface-->Drive.isImplemented-->driveImp." + method + ": " + hasMethod);
                            	return hasMethod;
                            },
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
