/**
 *  
 *
 *  
 *
 *  @module Ozone.Services.AppsMall
 *  @class Ozone.Services.AppsMall.Sort
 *  @submodule Server-Side
 */

/**
 * Sort constructor.
 * 
 * @class Sort
 * @module Processors
 * @constructor
 */
var Sort = function() {}

Sort.prototype = {
	debugging: false
};

/**
 * Default execution method for processors.
 * 
 * Assigns a sort direction and sort by column logic when
 * parameters are passed through the RESTful service.
 * 
 * @method run
 * @param {Array} queryParameters List of relevant query parameters from the RESTful request
 * @return {Object} Object describing MongoDB operation and parameters for the method
 */
Sort.prototype.run = function (queryParameters) {
	var i, j, k, obj, key, sortDir, sortFields = {}, sortObj = {};
	for (i = 0; i < queryParameters.length; i++) {
		obj = queryParameters[i];
		for (key in obj) {
			if (key === 'sort_dir') {
				sortDir = (obj[key].toLowerCase() === 'asc') ? 1 : -1;
			}
			else {
				if (typeof obj[key] === 'string') {
					sortFields[obj[key]] = true;
				}
				else {
					for (j = 0; j < obj[key].length; j++) {
						//Tokenized string.
						if (obj[key][j].indexOf(',') > -1) {
							var fieldList = obj[key][j];
							var fieldEntries = fieldList.split(',');
							for (k = 0; k < fieldEntries.length; k++) {
								sortFields[fieldEntries[k]] = true;
							}
						}
						// Single field value.
						else {
							sortFields[obj[key][j]] = true;
						}
					}
				}
			}
		}
	}

	// Default to descending.
	sortDir = sortDir || 1;
	
	// Recompose to MongoDB object
	for (key in sortFields) {
		sortObj[key] = sortDir;
	}
	
	return {
		operation: 'sort',
		parameters: sortObj
	};
};

/**
 * RESTful parameter fields relevant to the processor.
 * 
 * @method getQueryFields
 * return {Array} List of relevant parameters
 */
Sort.prototype.getQueryFields = function () {
	return ['sort_by', 'sort_dir'];
};

/**
 * RESTful parameter field descriptions.
 * 
 * @method queryFieldParameters
 * @return {Array} List of relevant field descriptions for the processor, where each list element
 *         has ```type, field, example,``` and ```description``` fields.
 */
Sort.prototype.queryFieldParameters = function () {
	return [{
		type: 'String',
		field: 'sort_by',
		example: 'sort_by=name,address,_id',
		description: 'Sorts a result set by a single or comma-delimted string of fields'
	},{
		type: 'String',
		field: 'sort_dir',
		example: 'sort_dir=asc',
		description: 'Sorts a record set by field in ascending (asc) or descending (desc) order'
	}];
};

//Node.js module export
module.exports = Sort;