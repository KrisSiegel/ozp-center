/**
	Helper methods for mock
*/
var Ozone = null,
	logger = null,
    async = require('async'),
    database = {}; // example: { 'apps' : { 'app' : { 'appId1here': { (obj1) } }, { 'appId2here': { (obj2) } }   } }

var initDatabase = function (store, collection) {
    if (database[store] === undefined) {
        database[store] = {};
    }
    if (database[store][collection] === undefined) {
        database[store][collection] = {};
    }
};
var getNewId = function (store, collection) {
    var id = Ozone.Utils.generateId();
    if (database[store] && database[store][collection]) {
        while (database[store][collection][id] !== undefined) {
            id = Ozone.Utils.generateId();
        }
    }

    return id;
};

module.exports = {

	init: function (_ozone) {
		Ozone = _ozone;
		logger = Ozone.logger;
	},
    get: function (store, collection, ids, callback) {
        logger.debug("mockHelper-->in get(" + collection + ") ids: " + JSON.stringify(ids));

        // initialize database obj if undefined
        initDatabase(store, collection);

        // create an array of results
        var elements = [];
        if (database[store] && database[store][collection]) {

            if (ids == null) { // get all
                for (var key in database[store][collection]) {
                	if (database[store][collection].hasOwnProperty(key)) {
                		var obj = database[store][collection][key];
                        elements.push(obj);
                	}
                }
            } else {
                for (var i = 0; i < ids.length; i++) {
                    var id = ids[i];
                    var obj = database[store][collection][id];
                    if (obj) {
                        elements.push(obj);
                    }
                }
            }
        }

        //logger.debug("mockHelper-->get-->database: " + JSON.stringify(database, null, 3));
        //logger.debug("mockHelper-->get-->elements: " + JSON.stringify(elements, null, 3));

        callback(null, elements);

    },
    query: function (store, collection, selector, options, callback) {
        logger.debug("mockHelper-->in query(" + collection + ") selector: " + JSON.stringify(selector));

        // initialize database obj if undefined
        initDatabase(store, collection);

        // create an array of results
        var elements = [];
        if (database[store] && database[store][collection]) {

            if (Ozone.Utils.isEmptyObject(selector)) { // get all
                for (var key in database[store][collection]) {
                	if (database[store][collection].hasOwnProperty(key)) {
                		var obj = database[store][collection][key];
                        elements.push(obj);
                	}
                }
            } else {
            	// for all the entries in the database, use the selector fields.
            	for (var id in database[store][collection]) {
        			if (database[store][collection].hasOwnProperty(id)) {
        				var obj = database[store][collection][id],
        					matched = true;

        				for (var field in selector) {
        					if (selector.hasOwnProperty(field)) {
        						var searchValue = selector[field];
        						// check if it's a regular expression search
                        		if (searchValue['$regex']) {
                        			var options = searchValue['$options'] || 'i'; // case insensitive by default
                        			var pattern = new RegExp(searchValue['$regex'], options);

                        			matched = matched && pattern.test(obj[field]);
                        		} else {
                        			matched = matched && obj[field] === selector[field];
                        		}
        					}
        				}
        				if (matched) {
        					elements.push(obj);
        				}
        			}
            	}
            }
        }

        //logger.debug("mockHelper-->query-->database: " + JSON.stringify(database, null, 3));
        //logger.debug("mockHelper-->query-->elements: " + JSON.stringify(elements, null, 3));

        callback(null, elements);

    },
    getFile: function (store, drive, ids, callback) {
        logger.debug("mockHelper-->in get(" + drive + ") ids: " + JSON.stringify(ids));

        // initialize database obj if undefined
        initDatabase(store, drive);

        // create an array of results?
        var elements = [];
        if (database[store] && database[store][drive]) {

            if (ids === null) { // get all
                for (var key in database[store][drive]) {
                	if (database[store][drive].hasOwnProperty(key)) {
                		var obj = database[store][drive][key];
                        if (obj) {
                            elements.push(obj);
                        }
                	}
                }
            } else {
                for (var i = 0; i < ids.length; i++) {
                    var id = ids[i];
                    var obj = database[store][drive][id];
                    if (obj) {
                        elements.push(obj);
                    }
                }
            }
        }

        //logger.debug("mockHelper-->getFile-->database: " + JSON.stringify(database, null, 3));
        //logger.debug("mockHelper-->getFile-->elements: " + JSON.stringify(elements, null, 3));

        callback(null, elements);

    },
    set: function (store, collection, objList, callback) {
        logger.debug("mockHelper-->in set(" + collection + ") objList: " + JSON.stringify(objList));

        if (database['apps'] !== undefined) {
        	logger.debug("database[apps][app]: " + JSON.stringify(database['apps']['app'], null ,3));
        }
        if (database['appsmall'] !== undefined) {
        	logger.debug("database[appsmall][review]: " + JSON.stringify(database['appsmall']['review'], null ,3));
        }

        // initialize database obj if undefined
        initDatabase(store, collection);

        var updatedResults = [];
        var context = this;

        var setFunction = function (obj, cb) {
            logger.debug("mockHelper-->set-->obj: " + JSON.stringify(obj));

            var id = Object.keys(obj)[0],
            	idObj = Ozone.Utils.convertStringToObject(id);

            logger.debug("mockHelper-->set-->id: " + id);
            if (Ozone.Utils.isObject(idObj)) {
            	logger.debug("mockHelper-->set-->id is an object, use it as a selector and query for it");
            	context.query(store, collection, idObj, null, function(err, results) {
            		logger.debug("mockHelper-->set-->query results: " + JSON.stringify(results));

            		var existingRecordId;
            		if (results.length === 1) {
            			existingRecordId = results[0]._id;
            		} else {
            			existingRecordId = 'null';
            		}

            		// save the field values from idObj (selector)
            		for (var key in idObj) {
            			if (idObj.hasOwnProperty(key)) {
            				obj[key] = idObj[key];
            			}
            		}
            		process(existingRecordId, id, obj, results[0], cb);
            	})
            } else {
            	process(id, null, obj, null, cb);
            }

            function process(id, origId, obj, existingObj, cb) {
            	var value = obj[id];
            	if (origId !== null) {
            		value = obj[origId];

            		// restore any old values that we didn't update
            		if (existingObj !== null) {
            			for (var key in existingObj) {
                			if (existingObj.hasOwnProperty(key) && value[key] === undefined) {
                				value[key] = existingObj[key];
                			}
                		}
            		}

            		// also put the field values from idObj (selector) that we saved
            		for (var key in obj) {
            			if (obj.hasOwnProperty(key) && key !== origId) {
            				value[key] = obj[key];
            			}
            		}
            	}
                logger.debug("mockHelper-->set-->obj w/ id: " + id + " value: " + JSON.stringify(value));

                // if id is null, create a new obj.
                if (id === 'null') {
                    logger.debug("mockHelper-->set-->create");

                    if (value._id) {
                        logger.debug("mockHelper-->set-->create-->value._id already exists: " + value._id);
                        id = value._id;
                    } else {
                        id = getNewId(store, collection);
                        value._id = id;
                    }

                    selectiveUpdate(value);

                    logger.debug("mockHelper-->set-->create-->using id: " + id);

                    // insert value to in-memory database object
                    database[store][collection][id] = value;

                    logger.debug("mockHelper-->set-->create-->in callback-->created " + JSON.stringify(value, null, 3));
                    //logger.debug("mockHelper-->set-->create-->database: " + JSON.stringify(database, null, 3));

                    updatedResults.push(value);
                    cb();
                } else { // upserting
                    var obj = database[store][collection][id];
                    if (obj && !selectiveUpdate(value)) { // update
                    	// update only the fields that are passed in the 'value'
                        for (var property in value) {
                        	if (value.hasOwnProperty(property)) {
                        		if (property != '_id') { // don't update _id
                                    obj[property] = value[property];
                                    logger.debug("mockHelper-->set-->upsert-->updating " + property + " to " + value[property]);
                                }
                        	}
                        }
                    } else { // create or complex update
                        logger.debug("mockHelper-->set-->upsert-->create/complex update!");
                        value._id = id;

                        database[store][collection][id] = value;
                    }

                    updatedResults.push(value);
                    cb();
                }
            }
        };

        async.each(objList, setFunction, function (err) {
            // if any of the setFunction calls produced an error, err would equal that error
            if (err) {
                logger.error("mockHelper-->set-->error: " + err);
                return callback(err);
            }
            //logger.debug("mockHelper-->set-->database: " + JSON.stringify(database, null, 3));
            callback(err, updatedResults);
        });

    },
    setFile: function (store, drive, objList, callback) {
        logger.debug("mockHelper-->in setFile(" + drive + ")");

        // initialize database obj if undefined
        initDatabase(store, drive);

        var updatedResults = [],
        	context = this;

        var setFileFunction = function (obj, cb) {
            var id = Object.keys(obj)[0],
                value = obj[id];

            // determine the file type if it's not specified
    		if (Ozone.Utils.isUndefinedOrNull(value.contentType)) {
    			var mimeType = require('mime').lookup(value.fileName);

    			value.contentType = !Ozone.Utils.isUndefinedOrNull(mimeType) ? mimeType : 'binary/octet-stream';
    			logger.debug("mongoHelper-->setToGridFS-->contentType was not set, now set to: " + mimeType);
    		}

            logger.debug("mockHelper-->setFile-->going to set obj w/ id: " + id); //" value: " + JSON.stringify(value));

            if (id === 'null') {
                id = getNewId(store, drive);
            }

            if (database[store][drive][id] === undefined) {
                database[store][drive][id] = {};
            }

            var objInDb = database[store][drive][id];

            objInDb._id = id;
            if (value.data) objInDb.data = value.data;
            if (value.metaData) objInDb.metadata = value.metaData;
            if (value.fileName) objInDb.filename = value.fileName;
            if (value.contentType) objInDb.contentType = value.contentType;

            updatedResults.push(objInDb);
            cb();
        };

        async.each(objList, setFileFunction, function (err) {
            // if any of the setFileFunction calls produced an error, err would equal that error
            if (err) {
                logger.error("mockHelper-->setFile-->error: " + err);
                return callback(err);
            }
            //logger.debug("mockHelper-->setFile-->database: " + JSON.stringify(database, null, 3));
            callback(err, updatedResults);
        });
    },
    remove: function (store, collection, ids, callback) {
        // initialize database obj if undefined
        initDatabase(store, collection);

        var elements = 0;
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            if (database[store][collection][id]) {
                logger.debug("deleting: " + JSON.stringify(database[store][collection][id]));
                delete database[store][collection][id];
                elements++;
            }
        }

        //logger.debug("mockHelper-->remove-->database: " + JSON.stringify(database, null, 3));
        logger.debug("mockHelper-->in remove callback-->Deleted " + elements + " elements.");


        callback(null, {
            count: elements
        });

    },
    removeFile: function (store, drive, ids, callback) {
        logger.debug("mockHelper-->in removeFile(" + drive + ")");

        var deletedFiles = [];
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            if (database[store][drive][id]) {
                //logger.debug("deleting: " + JSON.stringify(database[store][drive][id]));
                deletedFiles.push({
                    "DeletedFile": database[store][drive][id],
                    "Deleted": true
                });
                delete database[store][drive][id];
            }
        }

        //logger.debug("mockHelper-->removeFile-->database: " + JSON.stringify(database, null, 3));

        callback(null, deletedFiles);
    }
};

var selectiveUpdate = function(value) {
	var updated = false;

	if (value["$set"] !== undefined) {
    	var setValues = value["$set"];
    	for (key in setValues) {
    		if (setValues.hasOwnProperty(key)) {
    			value[key] = setValues[key];
    			logger.debug("mockHelper-->selectiveUpdate-->$set[" + key + "] to [" + value[key] + "]");
    		}
    	}
    	delete value["$set"];
    	updated = true;
    }
    if (value["$setOnInsert"] !== undefined) {
    	var setValues = value["$setOnInsert"];
    	for (key in setValues) {
    		if (setValues.hasOwnProperty(key)) {
    			value[key] = setValues[key];
    			logger.debug("mockHelper-->selectiveUpdate-->$setOnInsert[" + key + "] to [" + value[key] + "]");
    		}
    	}
    	delete value["$setOnInsert"];
    	updated = true;
    }

    return updated;
}
