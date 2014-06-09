module.exports = function (data, callback, Ozone) {
	var logger = Ozone.logger;

	var fs = require('fs');

	fs.readdir(__dirname + '/../importers/',function(err, files){
		if (err) {
			logger.error("AppsService-->importHelper-->error while reading importer files: " + err);
    		return callback(err);
		}

		var canProcess = false,
			importer;

		for (var i = 0; i < files.length; i++) {
			importer = require('../importers/' + files[i]);
			importer.init(Ozone);

			if (importer.canProcess(data)) {
				canProcess = true;
				logger.debug("AppsService-->importHelper-->found the capable importer: " + importer.getName());
				break;
			} else {
				logger.debug("AppsService-->importHelper-->importer isn't capable: " + importer.getName());
			}
		}

		if (!canProcess) {
			logger.debug("AppsService-->importHelper-->didn't find any capable importers");
    		callback({error: "didn't find any capable importers"});
		} else {
			importer.process(data, function(err, results) {
    			if (err) {
    				logger.error("AppsService-->importHelper-->error while processing: " + JSON.stringify(err));
    				return callback(err);
    			}
    			return callback(null, results);
    		});
		}
	 });
};
