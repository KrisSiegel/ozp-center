var Ozone = null,
	logger = null,
    path = require('path');


module.exports = function (target, _ozone) {
			Ozone = _ozone;
			logger = Ozone.logger;
    return {
	getName: function() {
		return path.basename(__filename);
	},
	canProcess: function(data) {
		logger.debug("TaggingService-->importers-->tag-json-->in canProcess()");
		return Ozone.Utils.isObject(data);
	},
	process: function(data, callback) {
		logger.debug("TaggingService-->importers-->tag-json-->in process()");
		
		this.insertItems(data.injectableRecords, callback);
	},
	insertItems: function(injectableRecords, callback) {
		var thingsToInsert = [],
			Persistence = Ozone.Service("Persistence");
		
		for (var i = 0; i < injectableRecords.length; i++) {
			var obj = {
					'null': injectableRecords[i]
				};
			
			thingsToInsert.push(obj);
		}
		
		Persistence.Store(target.store).Collection(target.collection).set(thingsToInsert, function(err, result) {
			if (err) {
				return callback(err);
			}
            callback(null, result);
		});
	}
    }
};
