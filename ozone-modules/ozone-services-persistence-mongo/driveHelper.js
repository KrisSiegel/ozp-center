var mongoHelper = require('./mongoHelper');


module.exports = function (Ozone) {
	var logger = Ozone.logger;
	mongoHelper.init(Ozone);

    return {
        get: function () {
            /*
			logger.debug("driveImp.get()-->arguments length: " + arguments.length);
			var args = Array.prototype.slice.call(arguments);
			for (var i = 0; i < args.length; i++) {
				logger.debug("arg" + i + ": " + args[i]);
			}
			*/

            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                drive = args[1],
                ids = args[2],
                callback = args[3];

            logger.debug("driveImp.get()-->now getting elements with ids: " + ids + " store: " + store + " coll: " + drive);
            //logger.debug("callback: " + callback);

            mongoHelper.getFromGridFS(store, drive, ids, function (err, fileDataArray) {
                if (err) {
                    logger.error("driveImp.get()-->error: " + err);
                    return callback(err);
                }
                callback(err, fileDataArray);
            });
        },
        set: function () {

            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                drive = args[1],
                ids = args[2],
                value = args[3],
                callback = args[4];

            logger.debug("driveImp.set()-->now setting elements with ids: " + ids + " store: " + store + " drive: " + drive);
            //logger.debug("callback: " + callback);

            mongoHelper.setToGridFS(store, drive, ids, value, function (err, obj) {
                if (err) {
                    logger.error("driveImp.set()-->error: " + err);
                    return callback(err);
                }

                callback(err, obj);
            });

        },
        remove: function () {

            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                drive = args[1],
                ids = args[2],
                callback = args[3];

            logger.debug("driveImp.remove()-->now removing elements with ids: " + ids + " store: " + store + " drive: " + drive);
            //logger.debug("callback: " + callback);

            mongoHelper.removeFromGridFS(store, drive, ids, function (err, obj) {
                if (err) {
                    logger.error("driveImp.remove()-->error: " + err);
                    return callback(err);
                }
                
                callback(err, obj);
            });
        }
    }
}
