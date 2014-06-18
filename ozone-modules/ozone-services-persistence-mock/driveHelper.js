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
            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                drive = args[1],
                ids = args[2],
                callback = args[3];

            logger.debug("driverImp.get()-->now getting elements with ids: " + ids + " store: " + store + " drive: " + drive);
            //logger.debug("callback: " + callback);

            // set findParams if necessary
            if (ids === null) {
                logger.debug("driverImp.get()-->ids is empty - get all elements.");
            } else {
                logger.debug("driverImp.get()-->getting elements with ids: " + ids);
            }

            mockHelper.getFile(store, drive, ids, function (err, obj) {
                if (err) {
                    logger.error("driverImp.get()-->error: " + err);
                    return callback(err);
                }

                callback(err, obj);
            });


        },
        set: function () {
            var args = Array.prototype.slice.call(arguments),
                store = args[0],
                drive = args[1],
                ids = args[2],
                value = args[3],
                callback = args[4];

            logger.debug("driveImp.set()-->now setting elements with ids: " + ids + " value: " + value + " store: " + store + " drive: " + drive);

            var objList = [];

            if (value === null && Ozone.Utils.isArray(ids)) {
                logger.debug("driveImp.set()-->value is null - we have arrays of <id>, <obj>.");
                objList = ids;
            } else {
                logger.debug("driveImp.set()-->we have one set of <id>,<obj>");

                var obj = {};
                obj[ids] = value;
                objList.push(obj);
            }

            mockHelper.setFile(store, drive, objList, function (err, obj) {
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

            logger.debug("driveImp.remove()-->now removing elements with ids: " + ids + " store: " + store + " coll: " + drive);

            mockHelper.removeFile(store, drive, ids, function (err, obj) {
                if (err) {
                    logger.error("driveImp.remove()-->error: " + err);
                    return callback(err);
                }

                callback(err, obj);
            });
        }
    }
}
