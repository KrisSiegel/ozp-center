/**
	Mongo helper methods
*/
var logger = null,
	Ozone = null,
	mongo = require('mongodb'),
	MongoConnect = require('./MongoConnect'),
    async = require('async'),
    ObjectID = mongo.ObjectID,
    databaseMap = {}, // key: the 'store' name, value: Mongo's db object
    user,
    password;

module.exports = {
	init: function (_ozone) {
		Ozone = _ozone;
		logger = Ozone.logger;
		user = Ozone.config().getServerProperty("persistence.mongo.user");
		password = Ozone.config().getServerProperty("persistence.mongo.password");
	},
	get: function(store, collection, ids, callback) {
		this.doAuth(store, function () {
			var db = this.getDatabase(store),
				model = this.getCollection(store, collection, db),
				findParams = {};

			// set findParams if necessary
	        if (ids === null) {
	            logger.debug("mongoHelper-->get-->ids is empty - get all elements.");
	        } else {
	            logger.debug("mongoHelper-->get-->getting elements with ids: " + ids);
	            // set the _ids as ObjectID instead of String if it's not already, so they can be found in mongoDB.
	            convertObjectIdsArray(ids);

	            findParams['_id'] = {
	                $in: ids
	            };
	        }

			logger.debug("mongoHelper-->in get(" + model.collectionName + ") findParams: " + JSON.stringify(findParams));

			model.find(findParams).toArray(function(err, elements) {
				if (err) {
					logger.error("mongoHelper-->Error occurred while searching with mongo's find: " + JSON.stringify(findParams) + " err: " + err);
					return callback(err);
				}
				logger.debug("mongoHelper-->in get callback-->Found " + elements.length + " elements.");

				callback(err, elements);
			});
		});
	},
	query: function(store, collection, selector, options, callback) {
		this.doAuth(store, function () {
			var db = this.getDatabase(store),
				model = this.getCollection(store, collection, db);

			logger.debug("mongoHelper-->in query(" + model.collectionName + ") selector: " + JSON.stringify(selector) + " options: " + JSON.stringify(options));

			if (Ozone.Utils.isUndefinedOrNull(options)) {
				options = {};
			}
			if (options.type == 'TextSearch') { // use Mongo's Text Search
				logger.debug("mongoHelper-->query-->use Mongo Text Search")

				// find out what field the text search is for; there should only be one in the selector.
				var searchField = Object.keys(selector)[0],
					searchParams = {
						text: model.collectionName,
						search: selector[searchField]
					};

				if (options.filter) searchParams.filter = options.filter;
				if (options.limit) searchParams.limit = options.limit; // currently only limit is allowed in the 'text 'command in mongo, not sort/skip.

				logger.debug("mongoHelper-->query-->searchParams: " + JSON.stringify(searchParams) );

				// text search - the caller of this API method should make sure the text indexes are created before calling this;
				// the creation of the text indexes may take a long time if there are large datasets.
				db.command(searchParams, function(err, results){
					if (err || results.errmsg) {
						logger.error("Error occurred while searching with Mongo's Text Search - err: " + err);
						return callback(err || results.errmsg);
					}

					logger.debug("mongoHelper-->query-->in text search callback-->search:" + selector[searchField] +
									" filter: " + JSON.stringify(options.filter) + " results: " + JSON.stringify(results, null, 3));

					// iterate the results and only get the "obj" field from results.results array
					var elements = [];
					for (var i = 0; i < results.results.length; i++) {
						var record = results.results[i]; // has score, obj fields
						elements.push(record.obj);
					}

					callback(err, elements);
				});

			} else {
				logger.debug("mongoHelper-->query-->use Mongo find")

				// if _id is part of the selector, set it as ObjectID if it's not already.
				if (!Ozone.Utils.isUndefinedOrNull(selector._id)) {
					selector._id = convertObjectId(selector._id);
				}

				model.find(selector, options).toArray(function(err, elements) {
					if (err) {
						logger.error("mongoHelper-->query-->Error occurred while searching with mongo's find: " + JSON.stringify(selector) + " err: " + err);
						return callback(err);
					}
					logger.debug("mongoHelper-->query-->in find callback-->Found " + elements.length + " elements.");

					callback(err, elements);
				});
			}
		});
	},
	aggregate: function(store, collection, aggregationArray, callback) {
		this.doAuth(store, function () {
			var db = this.getDatabase(store),
				model = this.getCollection(store, collection, db);

			logger.debug("mongoHelper-->in aggregate(" + model.collectionName + ")");

			model.aggregate(aggregationArray, function(err, elements) {
				if (err) {
					logger.error("mongoHelper-->aggregate-->Error occurred while searching with mongo's aggregate: " +
									aggregationArray + " err: " + err);
					return callback(err);
				}
				logger.debug("mongoHelper-->in aggregate callback-->Found " + elements.length + " elements.");

				callback(err, elements);
			});
		});
	},
	getFromGridFS: function(store, drive, ids, callback) {
		// find all 'files' documents from mongoDB using findParams, and for each,
		// call grid.get() method if querying by the _id(ObjectId),
		// or use GridStore if querying by the filename.
		// We are currently querying by the _id.

		logger.debug("mongoHelper-->in getFromGridFS(" + drive + ")");

		this.doAuth(store, function () {
			var filesCollectionName = drive + '.files',
				fileDataArray = [],
				db = this.getDatabase(store),
				filesCollection = this.getCollection(store, filesCollectionName, db),
				rootCollectionName = this.getCollection(store, drive, db).collectionName,
				findParams = {};

			// set findParams if necessary
	        if (ids === null) {
	            logger.debug("mongoHelper-->getFromGridFS-->ids is empty - get all elements.");
	        } else {
	            logger.debug("mongoHelper-->getFromGridFS-->getting elements with ids: " + ids);
	            // set the _ids as ObjectID instead of String if it's not already, so they can be found in mongoDB.
	            convertObjectIdsArray(ids);

	            findParams['_id'] = {
	                $in: ids
	            };
	        }

	        logger.debug("mongoHelper-->getFromGridFS-->findParams: " + JSON.stringify(findParams));

	        filesCollection.find(findParams).toArray(function(err, results) {
				logger.debug('mongoHelper-->getFromGridFS-->got ' + filesCollection.collectionName + ": " + JSON.stringify(results, null, 3));

				var getFromGridFSWithIdFunction = function(result, cb) {
					var grid = new mongo.Grid(db, rootCollectionName);
					getFromGridFSWithId(grid, result._id, function(err, obj) {
						if (err) return cb(err);
						fileDataArray.push({ gridFSfile: result, data: obj });
						cb();
					});
				};

				if (results !== undefined && results !== null) {
					async.each(results, getFromGridFSWithIdFunction, function(err){
					    // if any of the getFromGridFSWithIdFunction calls produced an error, err would equal that error
						if (err) {
							logger.error("mongoHelper-->getFromGridFS-->error: " + err);
							return callback(err);
						}
						callback(err, fileDataArray);
					});
				} else {
					callback(err, []);
				}
			});
		});

	},
	set: function(store, collection, ids, value, callback) {
		this.doAuth(store, function () {
			var db = this.getDatabase(store),
				model = this.getCollection(store, collection, db),
				objList = [];

	        if (value === null && Ozone.Utils.isArray(ids)) {
	            logger.debug("mongoHelper-->set-->value is null - we have arrays of <id>, <obj>.");
	            objList = ids;
	        } else {
	            logger.debug("mongoHelper-->set-->we have one set of <id>,<obj>");

	            var obj = {};
	            obj[ids] = value;
	            objList.push(obj);
	        }

			//logger.debug("mongoHelper-->in set(" + model.collectionName + ") objList: " + JSON.stringify(objList));

			var updatedResults = [];

			var setFunction = function(obj, cb) {
				//logger.debug("mongoHelper-->set-->obj: " + JSON.stringify(obj));

				var id = Object.keys(obj)[0];
				var value = obj[id];
				logger.debug("mongoHelper-->set-->obj w/ id: " + JSON.stringify(id) + " value: " + JSON.stringify(value));

				// if id is null, create a new obj.
				if (id == 'null') {
					logger.debug("mongoHelper-->set-->creating a new obj.");

					// if value obj already has an _id, set it as ObjectID so it can be found in mongoDB.
					if (value._id) {
						logger.debug("mongoHelper-->set-->value._id already exists: " + value._id);
						value._id = convertObjectId(value._id);
					}

					model.insert(value, { safe: true }, function(err, elements) {
						if (err) {
							logger.error("mongoHelper-->set-->Error occurred while creating: " + JSON.stringify(value) + " err: " + err);
							return callback(err);
						}
						logger.debug("mongoHelper-->set-->in insert callback-->created " + JSON.stringify(elements));
						updatedResults.push(elements[0]); // elements should be an array of 1 object
						cb();
					});
				}
				else { // upserting
					var idObj = Ozone.Utils.convertStringToObject(id),
						findParams = getFindParamsForUpdate(id, idObj),
					    updateObj = getUpdateObj(value);
					logger.debug("mongoHelper-->set-->findParams: " + JSON.stringify(findParams));

					// need to remove the _id field from value, since MongoDB will throw "Mod on _id not allowed" error.
					delete value._id;

					model.update(findParams, updateObj, { upsert: true }, function(err, elements) {
						if (err) {
							logger.error("mongoHelper-->set-->Error occurred while updating: " + JSON.stringify(findParams) + " err: " + err);
							return callback(err);
						}
						// put the _id value back in the orig obj since it may be needed later (for example, Tag objects)
						if (idObj === undefined) {
							value._id = convertObjectId(id);
						}

						logger.debug("mongoHelper-->set-->in update callback-->upserted count:" + elements);
						updatedResults.push(elements);
						cb();
					});
				}
			};

			async.each(objList, setFunction, function(err){
			    // if any of the setFunction calls produced an error, err would equal that error
				if (err) {
					logger.error("mongoHelper-->set-->error: " + err);
					return callback(err);
				}
				callback(err, updatedResults);
			});
		});
	},
	setToGridFS: function(store, drive, ids, value, callback) {
		logger.debug("mongoHelper-->in setToGridFS(" + drive + ")");
		this.doAuth(store, function () {
			var updatedResults = [],
				db = this.getDatabase(store),
				rootCollectionName = this.getCollection(store, drive, db).collectionName,
				objList = [];

	        if (value === null && Ozone.Utils.isArray(ids)) {
	            logger.debug("mongoHelper-->setToGridFS-->value is null - we have arrays of <id>, <obj>.");
	            objList = ids;
	        } else {
	            logger.debug("mongoHelper-->setToGridFS-->we have one set of <id>,<obj>");

	            var obj = {};
	            obj[ids] = value;
	            objList.push(obj);
	        }
	        //logger.debug("mongoHelper-->setToGridFS-->objList: " + JSON.stringify(objList));

			var setToGridFSFunction = function(obj, cb) {
				var grid = new mongo.Grid(db),
				    id = Object.keys(obj)[0],
				    fileName = obj[id].fileName,
				    data = obj[id].data,
				    contentType = obj[id].contentType,
				    metaData = obj[id].metaData;

				logger.debug("mongoHelper-->setToGridFS-->fileName: " + fileName + " rootCollectionName: " + rootCollectionName);

				// determine the file type if it's not specified
	    		if (Ozone.Utils.isUndefinedOrNull(contentType)) {
	    			var mimeType = require('mime').lookup(fileName);

	    			contentType = !Ozone.Utils.isUndefinedOrNull(mimeType) ? mimeType : 'binary/octet-stream';
	    			logger.debug("mongoHelper-->setToGridFS-->contentType was not set, now set to: " + mimeType);
	    		}

				logger.debug("mongoHelper-->setToGridFS-->going to set obj w/ id: " + id );//" value: " + JSON.stringify(value));
				logger.debug("mongoHelper-->setToGridFS-->contentType: " + contentType);
				//use grid.put
				var options = {
					root: rootCollectionName,
					filename: fileName, // filename seems to be ignored when updating existing files
					content_type: contentType,
					metadata: metaData
				};
				if (id != 'null') {
					options._id = convertObjectId(id);
				}

				grid.put(data, options, function(err, result) {
					if (err) return cb(err);
					updatedResults.push(result);
					logger.debug("mongoHelper-->setToGridFS-->done with grid.put");
					cb();
				});
			};

			async.each(objList, setToGridFSFunction, function(err){
			    // if any of the setToGridFSFunction calls produced an error, err would equal that error
				if (err) {
					logger.error("mongoHelper-->setToGridFS-->error: " + err);
					return callback(err);
				}
				callback(err, updatedResults);
			});
		});
	},
	remove: function(store, collection, ids, callback) {
		this.doAuth(store, function () {
			var db = this.getDatabase(store),
				model = this.getCollection(store, collection, db),
				findParams = {};

			// set findParams
	        // set the _ids as ObjectID instead of String if it's not already, so they can be found in mongoDB.
	        convertObjectIdsArray(ids);

	        findParams['_id'] = {
	            $in: ids
	        };

			logger.debug("mongoHelper-->in remove(" + model.collectionName + ") findParams: " + JSON.stringify(findParams));

			model.remove(findParams, function(err, elements) {
				if (err) {
					logger.error("mongoHelper-->Error occurred while removing: " + JSON.stringify(findParams) + " err: " + err);
					return callback(err);
				}
				logger.debug("mongoHelper-->in remove callback-->Deleted " + elements + " elements.");


				callback(err, { count:elements });
			});
		});
	},
	removeFromGridFS: function(store, drive, ids, callback) {
		logger.debug("mongoHelper-->in removeFromGridFS(" + drive + ") ids: " + ids);
		this.doAuth(store, function () {
			var filesCollectionName = drive + '.files',
				fileDataArray = [],
				db = this.getDatabase(store),
				filesCollection = this.getCollection(store, filesCollectionName, db),
				rootCollectionName = this.getCollection(store, drive, db).collectionName,
				findParams = {};

			// set the _ids as ObjectID instead of String if it's not already, so they can be found in mongoDB.
	        convertObjectIdsArray(ids);

	        // set findParams
	        findParams['_id'] = {
	            $in: ids
	        };

	        logger.debug("mongoHelper-->removeFromGridFS-->, findParams: " + JSON.stringify(findParams));

	        filesCollection.find(findParams).toArray(function(err, results) {
				logger.debug('mongoHelper-->removeFromGridFS-->find-->got ' + filesCollection.collectionName + ": " + JSON.stringify(results, null, 3));

				var removeFromGridFSWithIdFunction = function(result, cb) {
					var grid = new mongo.Grid(db, rootCollectionName);
					removeFromGridFSWithId(grid, result._id, function(err, deleted) {
						if (err) return cb(err);
						fileDataArray.push({ gridFSfile: result, deleted: deleted });
						cb();
					});
				};

				async.each(results, removeFromGridFSWithIdFunction, function(err){
				    // if any of the removeFromGridFSWithIdFunction calls produced an error, err would equal that error
					if (err) {
						logger.error("mongoHelper-->removeFromGridFS-->error: " + err);
						return callback(err);
					}
					callback(err, fileDataArray);
				});

			});
		});
	},
	addIndex: function(store, collection, index, options, callback) {
		this.doAuth(store, function () {
			var db = this.getDatabase(store),
				model = this.getCollection(store, collection, db);

			logger.debug("mongoHelper-->addIndex-->store: " + store + " coll: " + collection + " index: " + JSON.stringify(index) + " options: " + options);

			model.ensureIndex(index, options, function(err, indexName) {
				logger.debug("mongoHelper-->addIndex-->ensured index-->indexName: " + indexName);
				callback(err, { indexName: indexName } );
			})
		});
	},
	getIndexes: function(store, collection, callback) {
		this.doAuth(store, function () {
			var db = this.getDatabase(store),
				model = this.getCollection(store, collection, db);

			logger.debug("mongoHelper-->getIndexes-->store: " + store + " coll: " + collection);

			model.indexInformation({ full: true }, function(err, indexInformation) {
				logger.debug("mongoHelper-->getIndexes-->got indexes-->indexInformation: " + indexInformation);
				callback(err, { indexInformation: indexInformation } );
			})
		});
	},
	removeIndex: function(store, collection, indexName, callback) {
		this.doAuth(store, function () {
			var db = this.getDatabase(store),
				model = this.getCollection(store, collection, db);

			logger.debug("mongoHelper-->removeIndex-->indexName: " + indexName + " store: " + store + " coll: " + collection);

			model.dropIndex(indexName, function(err, result) {
				logger.debug("mongoHelper-->removeIndex-->removed-->result: " + result);
				callback(err, { result: result } );
			})
		});
	},
	removeAllIndexes: function(store, collection, callback) {
		this.doAuth(store, function () {
			var db = this.getDatabase(store),
				model = this.getCollection(store, collection, db);

			logger.debug("mongoHelper-->removeAllIndexes--> store: " + store + " coll: " + collection);

			model.dropAllIndexes(function(err, result) {
				logger.debug("mongoHelper-->removeAllIndexes-->removed-->result: " + result);
				callback(err, { result: result } );
			})
		});
	},
	getDatabaseName: function(store) {
		return (Ozone.config().getServerProperty("persistence.store") || "Ozone");
	},
	getDatabase: function(store) {
		var storeName = this.getDatabaseName(store);
		return databaseMap[storeName];
	},
	getCollection: function(store, collection, db) {
		var collectionName = store + "_" + collection;

		logger.debug("mongoHelper-->getCollection-->collectionName: " + collectionName);

		return db.collection(collectionName);
	},
	doAuth: function (store, callback) {
		var db,
			storeName = this.getDatabaseName(store);

		if (databaseMap[storeName] === undefined) {
			db = MongoConnect.getDb();
			databaseMap[storeName] = db;
			callback.apply(this, ["", true]);
		} else {
			callback.apply(this, ["", true]);
		}
	},
	convertObjectIdsArray: convertObjectIdsArray,
	convertObjectId: convertObjectId
};
var convertObjectIdsArray = function (ids) {
    for (var i = 0; i < ids.length; i++) {
        var id = convertObjectId(ids[i]);
        ids[i] = id;
    }
};
var convertObjectId = function (id) {
    if (typeof id === 'string' && id != 'null') {
        logger.debug("mongoHelper-->convertObjectId-->id: " + id + " is a non-null string.");
        id = new ObjectID(id);
    }

    return id;
};
var getFindParamsForUpdate = function(id, idObj) {
	var findParams = {};

	// check if the _id is an object - then need to use that exact object as the findParams.
	// ex: { app: appname, user: userId }
	if (idObj !== undefined) {
		findParams = idObj;
		logger.debug("mongoHelper-->set-->idObj: " + JSON.stringify(idObj));
	}
	else {
		findParams._id = convertObjectId(id);
	}

	return findParams;
};
var getUpdateObj = function(value) {
	// Mongo's update object to use
	var updateObj = { $set: value }; // updates specific fields, not the whole Mongo document.

	// check if we are doing a complex update with the 'value'.
	// ex: {"$set": {"starRating": update.rating,
	// 				 "dateModified": now,
	// 				 "reviewText": (update.reviewText || '')},
	// 		"$setOnInsert": {"dateCreated": now}}
	if (value['$set'] !== undefined || value['$setOnInsert'] !== undefined || value['$unset'] !== undefined ||
			value['$inc'] !== undefined || value['$rename'] !== undefined) {
		// use the whole 'value' object as the update object
		updateObj = value;
		logger.debug("mongoHelper-->getUpdateObj-->we are doing a complex update, so setting value as the updateObj.");
	}

	return updateObj;
};
var getFromGridFSWithId = function(grid, id, callback) {
	logger.debug("mongoHelper-->in getFromGridFSWithId(" + grid.fsName + ") id: " + id);

	grid.get(id, function(err, data) {
		if (err) {
			logger.error("mongoHelper-->getFromGridFSWithId-->Error occurred while searching with id: " + id + " err: " + err);
			return callback(err);
		}
		logger.debug("mongoHelper-->getFromGridFSWithId-->callback-->data size: " + data.length);

		callback(err, data);
	});
};
var removeFromGridFSWithId = function(grid, id, callback) {
	logger.debug("mongoHelper-->in removeFromGridFSWithId(" + grid.fsName + ") id: " + id);

	grid.delete(id, function(err, deleted) {
		if (err) {
			logger.error("mongoHelper-->removeFromGridFSWithId-->Error occurred while deleting with id: " + id + " err: " + err);
			return callback(err);
		}
		logger.debug("mongoHelper-->removeFromGridFSWithId-->callback-->deleted: " + deleted);

		callback(err, deleted);
	});
};
