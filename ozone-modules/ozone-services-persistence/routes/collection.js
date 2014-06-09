module.exports = exports = function (Ozone) {

    var baseURL = require('../config/version.json').rest.url,
        routing = Ozone.Routing,
        logger = Ozone.logger,
        Persistence = Ozone.Service('Persistence');

    // set up routing for RESTful data access (collections)

    // Create/Update collections
    var putPostCollection = function(req, res, next) {
    	var store = req.params.store,
    		collection = req.params.collection,
    		data = req.body; // is an array

    	logger.debug("Routes(PersistenceService)-->Put/Post(Collection)-->req.url: " + req.url + " store: " + store +
    					" collection: " + collection + " data: " + JSON.stringify(data));

    	var callback = function(err, result) {
    		if (err) {
    			logger.error('Routes(PersistenceService)-->Put/Post(Collection)-->An error has occurred: ' + err);
    			res.send({
    				'error': 'An error has occurred: ' + err
    			});
    			return next(err);
    		}

    		logger.debug("Routes(PersistenceService)-->Put/Post(Collection)-->result: " + JSON.stringify(result, null, 3));

    		var elements = result;

    		res.send(elements);
    	};

    	if (Ozone.Utils.isArray(data)) { // is it an actual array or a string that has [ ]? seems to be actual array from unit test
    		// we are doing either group insert/update, or single update.
    		logger.debug("Routes(PersistenceService)-->Put/Post(Collection)-->data is an array: " + data);
    		Persistence.Store(store).Collection(collection).set(data, callback);
    	} else if (data.findParams !== undefined && data.updateObj !== undefined) {
    		// we are doing a complex update
    		logger.debug("Routes(PersistenceService)-->Put/Post(Collection)-->do a complex update: " +
    						" findParams: " + JSON.stringify(data.findParams) + " updateObj: " + JSON.stringify(data.updateObj));
    		Persistence.Store(store).Collection(collection).set(data.findParams, data.updateObj, callback);
    	}
    };

    routing.post(baseURL + '/store/:store/collection/:collection', putPostCollection);
    routing.put(baseURL + '/store/:store/collection/:collection', putPostCollection);

    // Get collections
    var getCollection = function(id, req, res, next) {
    	var store = req.params.store,
    		collection = req.params.collection;

    	logger.debug("Routes(PersistenceService)-->Get(Collection)-->req.url: " + req.url + " store: " + store +
    			" collection: " + collection + " id: " + JSON.stringify(id));

    	Persistence.Store(store).Collection(collection).get(id, function(err, results) {
    		if (err) {
    			logger.error('Routes(PersistenceService)-->Get(Collection)-->An error has occurred: ' + err);
    			res.send({
    				'error': 'An error has occurred: ' + err
    			});
    			return next(err);
    		}

    		//logger.debug("Routes(PersistenceService)-->Get(Collection)-->results: " + JSON.stringify(results, null, 3));

    		var elements = results;
    		logger.debug("Routes(PersistenceService)-->Get(Collection)-->got " + elements.length + " elements.");

    		res.send(elements);
    	});

    };

    routing.get(baseURL + '/store/:store/collection/:collection/:id', function (req, res, next) {
    	// req.params.id is either an array or a string id
    	var obj = Ozone.Utils.convertStringToObject(req.params.id);
    	var id = obj !== undefined ? obj : req.params.id;

    	getCollection(id, req, res, next);
    });

    routing.get(baseURL + '/store/:store/collection/:collection', function (req, res, next) {
    	getCollection(undefined, req, res, next);
    });

    // Query collections
    routing.get(baseURL + '/store/:store/collection/:collection/query/:criteria', function (req, res, next) {
    	var store = req.params.store,
			collection = req.params.collection,
			criteria = Ozone.Utils.convertStringToObject(req.params.criteria);

    	if (Ozone.Utils.isUndefinedOrNull(criteria)) {
    		logger.error('Routes(PersistenceService)-->Query(Collection)-->An error has occurred: ' +
    						' Please pass the query options.');
            res.send({
                'error': 'An error has occurred: query options not passed.'
            });
            return next(err);
    	}

    	var selector = criteria.selector,
    		options = criteria.options;

    	logger.debug("Routes(PersistenceService)-->Get(Collection)-->req.url: " + req.url + " store: " + store +
    					" collection: " + collection + " criteria: " + JSON.stringify(criteria));

    	Persistence.Store(store).Collection(collection).query(selector, options, function(err, result) {
    		if (err) {
                logger.error('Routes(PersistenceService)-->Query(Collection)-->An error has occurred: ' + err);
                res.send({
                    'error': 'An error has occurred: ' + err
                });
                return next(err);
            }

    		//logger.debug("Routes(PersistenceService)-->Query(Collection)-->result: " + JSON.stringify(result, null, 3));
    		var elements = result;
            logger.debug("Routes(PersistenceService)-->Query(Collection)-->got " + elements.length + " elements.");

            res.send(elements);
    	});

    });

    // Remove collections
    routing.delete(baseURL + '/store/:store/collection/:collection/:id', function (req, res, next) {
    	var store = req.params.store,
			collection = req.params.collection
			// req.params.id is either an array or a string id
			obj = Ozone.Utils.convertStringToObject(req.params.id),
			id = obj !== undefined ? obj : req.params.id;

    	logger.debug("Routes(PersistenceService)-->Remove(Collection)-->req.url: " + req.url + " store: " + store +
    			" collection: " + collection + " id: " + JSON.stringify(id));

    	Persistence.Store(store).Collection(collection).remove(id, function(err, result) {
    		if (err) {
                logger.error('Routes(PersistenceService)-->Remove(Collection)-->An error has occurred: ' + err);
                res.send({
                    'error': 'An error has occurred: ' + err
                });
                return next(err);
            }

    		//logger.debug("Routes(PersistenceService)-->Remove(Collection)-->result: " + JSON.stringify(result, null, 3));
            logger.debug("Routes(PersistenceService)-->Remove(Collection)-->removed " + result.removed.count + " elements.");

            res.send(result.removed);
    	});
    });
};
