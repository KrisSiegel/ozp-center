/**
 *  
 *
 *  
 *
 *  @module Ozone.Services.AppsMall
 *  @class Ozone.Services.AppsMall.Filter
 *  @submodule Server-Side
 */

/**
 * Filter constructor.
 * 
 * @class Ozone.Services.AppsMall.Filter
 * @module Processors
 * @constructor
 */
var Filter = function() {}

Filter.prototype = {
	debugging: false
};

/**
 * Default execution method for processors.
 * 
 * Filters results from MongoDB based on assigned columns and expressions.
 * 
 * @method run
 * @param {Array} queryParameters List of relevant query parameters from the RESTful request
 * @return {Object} Object describing MongoDB operation and parameters for the method
 */
Filter.prototype.run = function (queryParameters) {
	var filterObj = {}
	return {
		operation: 'find',
		parameters: filterObj
	};
};

/**
 * RESTful parameter fields relevant to the processor.
 * 
 * @method getQueryFields
 * return {Array} List of relevant parameters
 */
Filter.prototype.getQueryFields = function () {
	return ['filter'];
};

/**
 * RESTful parameter field descriptions.
 * 
 * @method queryFieldParameters
 * @return {Array} List of relevant field descriptions for the processor, where each list element
  *         has ```type, field, example,``` and ```description``` fields.
 */
Filter.prototype.queryFieldParameters = function () {
	return [{
		type: 'String',
		field: 'filter',
		example: 'filter=name,address,_id',
		description: 'Filters a result set by a single or comma-delimted string of fields'
	}];
};

//Node.js module export
module.exports = Filter;