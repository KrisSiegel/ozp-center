var fs = require('fs');

/**
 * Parses parameters from the HTTP(s) body and maps appropriate functions
 * where appropriate. Uses modular approach to delegated processors by attaching
 * from file system.
 * 
 * @class QueryParameterProcessor
 * @constructor
 */

var QueryParameterProcessor = function(debugging) {
	this.debugging = debugging;
	var processors = {
		query: [],
		metadata: []
	};
	
	// Scan file system for parameter processors.
	if (this.debugging) console.log('QueryParameterProcessor::Constructor --> Scanning folder for processors: ' + __dirname);
	fs.readdirSync(__dirname + '/processors/').forEach(function(folder) {
		fs.readdirSync(__dirname + '/processors/' + folder).forEach(function(file) {
			if (debugging) console.log('QueryParameterProcessor::Constructor --> Attaching ' + file + ' as a ' + folder + ' processor.');
			var processorName = file.slice(0, -3).toLowerCase(); 
			var processorDef = require(__dirname + '/processors/' + folder + '/' + file);
			
			var obj = {};
			obj[processorName] = new processorDef();
			processors[folder].push(obj);
		});
	});
	this.processors = processors;
};

QueryParameterProcessor.prototype = {
	debugging: null,
	processors: {
		query: [],
		metadata: []
	}
};

/**
 * Parses RESTful parameters from the body and attaches handlers for metadata
 * and database query request to be injected into the master response.
 * 
 * @method parseRestParameters
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @return {Object} Processor output for response integration
 */

QueryParameterProcessor.prototype.parseRestParameters = function (req, res) {
	// Set up variables.
	var i, j, 
	categories = Object.keys(this.processors),
	toProcess = {
		query: [],
		metadata: []
	};
	
	// Scan each processor category.
	for (var index = 0; index < categories.length; index++) {
		var category = categories[index];
		// Execute all query processors.
		for (i = 0; i < this.processors[category].length; i++) {
			var operations = [];
			
			// Extract the keys/processor names from the storage object. These
			// are set by the file loader.
			var processorName = Object.keys(this.processors[category][i])[0];
			
			// For each query processor, get the query fields relevant to the RESTful service.
			var processorQueryFields = this.processors[category][i][processorName].getQueryFields();
			
			// For each defined RESTful parameter...
			for (var restfulParameter in req.query) {
				// ... scan from the file loader options...
				for (j = 0; j < processorQueryFields.length; j++) {
					// And match the request parameter to the handler.
					if (restfulParameter === processorQueryFields[j]) {
						var newOperation = {};
						newOperation[restfulParameter] = req.query[restfulParameter];
						operations.push(newOperation);
					}
				}
			}
			// If operations matched request parameters, push an operator.
			if (operations.length > 0) {
				toProcess[category].push(this.processors[category][i][processorName].run(req, res));
			}
		}
	}
	
	return toProcess;
}

//Node.js module export
module.exports = QueryParameterProcessor;