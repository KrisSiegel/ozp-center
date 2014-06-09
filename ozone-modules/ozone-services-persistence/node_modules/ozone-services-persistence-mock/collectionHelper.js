var Ozone = null,
	logger = null,
    mockHelper = require('./mockHelper');

module.exports = function () {
    return {
		init: function (_ozone) {
			Ozone = _ozone;
			logger = Ozone.logger;
			mockHelper.init(Ozone);
		},
        get: function () {
        	/*
            logger.debug("collectionImp.get()-->arguments length: " + arguments.length);
            var args = Array.prototype.slice.call(arguments);
            for (var i = 0; i < args.length; i++) {
                logger.debug("arg" + i + ": " + args[i]);
            }
			*/

            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                collection = args[1],
                ids = args[2],
                callback = args[3];;

            logger.debug("collectionImp.get()-->now getting elements with ids: " + ids + " store: " + store + " coll: " + collection);
            //logger.debug("callback: " + callback);

            // set findParams if necessary
            if (ids === null) {
                logger.debug("collectionImp.get()-->ids is empty - get all elements.");
            } else {
                logger.debug("collectionImp.get()-->getting elements with ids: " + ids);
            }

            mockHelper.get(store, collection, ids, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.get()-->error: " + err);
                    return callback(err);
                }
                logger.debug("in collectionImp.get(), obj: " + JSON.stringify(obj, null, 3));
                callback(err, obj);
            });
        },
        set: function () {
        	/*
            logger.debug("collectionImp.set()-->arguments length: " + arguments.length);
            var args = Array.prototype.slice.call(arguments);
            for (var i = 0; i < args.length; i++) {
                logger.debug("arg" + i + ": " + args[i]);
            }
			*/

            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                collection = args[1],
                ids = args[2],
                value = args[3],
                callback = args[4];

            logger.debug("collectionImp.set()-->now setting elements with ids: " + ids + " value: " + value + " store: " + store + " coll: " + collection);
            //logger.debug("callback: " + callback);

            var objList = [];

            if (value === null && Ozone.Utils.isArray(ids)) {
                logger.debug("collectionImp.set()-->value is null - we have arrays of <id>, <obj>.");
                objList = ids;
            } else {
                logger.debug("collectionImp.set()-->we have one set of <id>,<obj>");

                var obj = {};
                obj[ids] = value;
                objList.push(obj);
            }
            logger.debug("collectionImp.set()-->objList: " + JSON.stringify(objList));

            mockHelper.set(store, collection, objList, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.set()-->error: " + err);
                    return callback(err);
                }

                callback(err, obj);
            });
        },
        remove: function () {
            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                collection = args[1],
                ids = args[2],
                callback = args[3];

            logger.debug("collectionImp.remove()-->now removing elements with ids: " + ids + " store: " + store + " coll: " + collection);

            mockHelper.remove(store, collection, ids, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.remove()-->error: " + err);
                    return callback(err);
                }
                logger.debug("in collectionImp.remove(), obj: " + JSON.stringify(obj, null, 3));

                callback(err, obj);
            });
        },
        query: function() {
        	var args = Array.prototype.slice.call(arguments),
        	store = args[0],
        	collection = args[1],
        	selector = args[2],
        	options = args[3],
        	callback = args[4];

        	logger.debug("collectionImp.query()-->now getting elements with selector: " + JSON.stringify(selector) +
        					" options: " + options + " store: " + store + " coll: " + collection);

        	mockHelper.query(store, collection, selector, options, function (err, obj) {
        		if (err) {
        			logger.error("collectionImp.query()-->error: " + err);
        			return callback(err);
        		}

        		callback(err, obj);
        	});
        },
        addIndex: function () {
        	var args = Array.prototype.slice.call(arguments),
            store = args[0],
            collection = args[1],
            index = args[2],
            options = args[3],
            callback = args[4];

        	logger.debug("collectionImp.addIndex() not implemented for mock - doesn't do anything.");
        	callback(null, {});
        },
        getIndexes: function () {
        	var args = Array.prototype.slice.call(arguments),
            store = args[0],
            collection = args[1],
            callback = args[2];

        	logger.debug("collectionImp.getIndexes() not implemented for mock - doesn't do anything.");
        	callback(null, {});
        },
        removeIndex: function () {
        	var args = Array.prototype.slice.call(arguments),
            store = args[0],
            collection = args[1],
            index = args[2],
            callback = args[3];

        	logger.debug("collectionImp.removeIndex() not implemented for mock - doesn't do anything.");
        	callback(null, {});
        },
        removeAllIndexes: function () {
        	var args = Array.prototype.slice.call(arguments),
            store = args[0],
            collection = args[1],
            callback = args[2];

        	logger.debug("collectionImp.removeAllIndexes() not implemented for mock - doesn't do anything.");
        	callback(null, {});
        }
    }
}
