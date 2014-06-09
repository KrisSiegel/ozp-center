var Ozone = null,
	logger = null,
	constants = require('../constants'),
    appsStore = constants.database.store.apps,
    appCollection = constants.database.collection.app,
    path = require('path');


module.exports = {
	init: function (_ozone) {
			Ozone = _ozone;
			logger = Ozone.logger;
	},
	getName: function() {
		return path.basename(__filename);
	},
	canProcess: function(data) {
		logger.debug("AppsService-->importers-->application-json-->in canProcess()");
		try {
			return Ozone.Utils.isObject(JSON.parse(data));
		} catch (e) {
			return false;
		}
	},
	process: function(data, callback) {
		logger.debug("AppsService-->importers-->application-json-->in process()");

		var injectableRecords = JSON.parse(data).injectableRecords;
		if (injectableRecords === undefined) {
			return callback({error: "injectableRecords field does not exist."});
		}

		this.insertApps(injectableRecords, callback);
	},
	insertApps: function(injectableRecords, callback) {
		var appsToInsert = [],
			Persistence = Ozone.Service("Persistence");

		for (var i = 0; i < injectableRecords.length; i++) {
			var obj = {
					'null': injectableRecords[i]
				};

			appsToInsert.push(obj);
		}

		Persistence.Store(appsStore).Collection(appCollection).set(appsToInsert, function(err, result) {
			if (err) {
				return callback(err);
			}
			callback(null, result.elements);
		});
	}
};
