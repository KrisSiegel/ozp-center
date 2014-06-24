/**
 *  The Tagging module handles all RESTful calls for Tag and Topic objects.
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.Tagging
 *  @class Ozone.Services.Tagging
 *  @submodule Server-Side
 */
var Ozone = null,
	logger = null;


module.exports = function (data, target, callback, _ozone) {
		Ozone = _ozone;
		logger = Ozone.logger;

	var fs = require('fs');

	fs.readdir(__dirname + '/../importers/',function(err, files){
		if (err) {
			logger.error("TaggingService-->importHelper-->error while reading importer files: " + err);
    		return callback(err);
		}
	    
		
		var canProcess = false;
		
		for (var i = 0; i < files.length; i++) {
			var file = files[i],
				importer = require('../importers/' + file)(target, Ozone);

			if (importer.canProcess(data)) {
				canProcess = true;
				logger.debug("TaggingService-->importHelper-->found the capable importer: " + importer.getName());
				
				importer.process(data, function(err, results) {
	    			if (err) {
	    				logger.error("TaggingService-->importHelper-->error while processing: " + err);
	    				return callback(err);
	    			}
	    			return callback(null, results);
	    		});
			} 
		}
		
		if (!canProcess) {
			logger.debug("TaggingService-->importHelper-->didn't find any capable importers");
    		callback({error: "didn't find any capable importers"});
		} 
	 });
};
