/**
 *  
 *
 *  
 *
 *  @module Ozone.Services.AppsMall
 *  @class Ozone.Services.AppsMall.UserRequest
 *  @submodule Server-Side
 */

/**
 * UserRequest constructor.
 * 
 * @class UserRequest
 * @module Processors
 * @constructor
 */
var UserRequest = function() {}

UserRequest.prototype = {
	debugging: false
};

/**
 * Default execution method for processors.
 * 
 * Attaches relevant metadata from the user's request to the RESTful service.
 * 
 * @method run
 * @param {Array} queryParameters List of relevant query parameters from the RESTful request
 * @return {Object} Object describing MongoDB operation and parameters for the method
 */
UserRequest.prototype.run = function (req, res) {
	return {
		requestInformation: {
			isAjax: req.xhr,
			clientIp: req.ip,
			host: req.host,
			requestMade: new Date(),
			protocol: req.protocol,
			restPath: req.originalUrl,
			acceptedCharsets: req.acceptedCharsets,
			acceptedLanguages: req.acceptedLanguages,
			server: req.protocol + '://' + req.headers['host'],
			userAgent: req.headers['user-agent']
		}
	};
};

/**
 * RESTful parameter fields relevant to the processor.
 * 
 * @method getQueryFields
 * return {Array} List of relevant parameters
 */
UserRequest.prototype.getQueryFields = function () {
	return ['request_info'];
};

/**
 * RESTful parameter field descriptions.
 * 
 * @method queryFieldParameters
 * @return {Array} List of relevant field descriptions for the processor
 */
UserRequest.prototype.queryFieldParameters = function () {
	return [{
		type: 'Boolean',
		field: 'request_info',
		example: 'request_info=true',
		description: 'Gives information about a user\'s request to the RESTful services'
	}];
};

//Node.js module export
module.exports = UserRequest;