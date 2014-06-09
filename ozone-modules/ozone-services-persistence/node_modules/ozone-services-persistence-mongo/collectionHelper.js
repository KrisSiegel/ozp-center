var mongoHelper = require('./mongoHelper');

module.exports = function (Ozone) {
	var logger = Ozone.logger;
	mongoHelper.init(Ozone);

    return {
        get: function () {
            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                collection = args[1],
                ids = args[2],
                callback = args[3];

            logger.debug("collectionImp.get()-->now getting elements with ids: " + ids + " store: " + store + " coll: " + collection);

            mongoHelper.get(store, collection, ids, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.get()-->error: " + err);
                    return callback(err);
                }
                callback(err, obj);
            });
        },
        query: function () {
            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                collection = args[1],
                selector = args[2],
                options = args[3],
                callback = args[4];

            logger.debug("collectionImp.query()-->now getting elements with selector: " + JSON.stringify(selector) +
            				" options: " + JSON.stringify(options) + " store: " + store + " coll: " + collection);

            mongoHelper.query(store, collection, selector, options, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.query()-->error: " + err);
                    return callback(err);
                }
                callback(err, obj);
            });
        },
        aggregate: function () {
            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                collection = args[1],
                aggregationArray = args[2],
                callback = args[3];

            logger.debug("collectionImp.aggregate()-->now aggregating elements with aggregationArray: " + JSON.stringify(aggregationArray) +
            				" store: " + store + " coll: " + collection);

            mongoHelper.aggregate(store, collection, aggregationArray, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.aggregate()-->error: " + err);
                    return callback(err);
                }
                callback(err, obj);
            });
        },
        set: function () {
            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                collection = args[1],
                ids = args[2],
                value = args[3],
                callback = args[4];

            logger.debug("collectionImp.set()-->now setting elements with ids: " + ids + " value: " + value + " store: " + store + " coll: " + collection);

            mongoHelper.set(store, collection, ids, value, function (err, obj) {
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

            mongoHelper.remove(store, collection, ids, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.remove()-->error: " + err);
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
                callback = args[4],
                returnObj = {
                    requested: {
                        "index": index,
                        "options": options,
                        "store": store,
                        "collection": collection
                    }
                };

            logger.debug("collectionImp.addIndex()-->now adding index: " + JSON.stringify(index) + " options: " + options + " store: " + store + " coll: " + collection);
            //logger.debug("callback: " + callback);

            mongoHelper.addIndex(store, collection, index, options, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.addIndex()-->error: " + err);
                    return callback(err);
                }
                //logger.debug("in collectionImp.addIndex(), obj: " + JSON.stringify(obj));
                returnObj.elements = obj;
                callback(err, returnObj);
            });

        },
        getIndexes: function () {
            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                collection = args[1],
                callback = args[2];

            logger.debug("collectionImp.getIndexes()-->now getting indexes, store: " + store + " coll: " + collection);
            //logger.debug("callback: " + callback);

            mongoHelper.getIndexes(store, collection, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.getIndexes()-->error: " + err);
                    return callback(err);
                }
                callback(err, obj);
            });

        },
        removeIndex: function () {
            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                collection = args[1],
                index = args[2],
                callback = args[3];

            logger.debug("collectionImp.removeIndex()-->now removing index: " + index + " store: " + store + " coll: " + collection);
            //logger.debug("callback: " + callback);

            mongoHelper.removeIndex(store, collection, index, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.removeIndex()-->error: " + err);
                    return callback(err);
                }
                callback(err, obj);
            });

        },
        removeAllIndexes: function () {
            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                collection = args[1],
                callback = args[2];

            logger.debug("collectionImp.removeAllIndexes()-->now getting indexes, store: " + store + " coll: " + collection);

            mongoHelper.removeAllIndexes(store, collection, function (err, obj) {
                if (err) {
                    logger.error("collectionImp.removeAllIndexes()-->error: " + err);
                    return callback(err);
                }
                callback(err, obj);
            });

        }
    }
}
