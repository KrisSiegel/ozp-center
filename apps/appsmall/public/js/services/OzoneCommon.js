/**
 * Service object for accessing Ozone API settings
 *
 * @module servicesModule
 * @submodule OzoneCommonModule
 * @requires amlApp.services
 */

'use strict';

/**
 * @class OzoneCommonService
 * @static
 */ 

/**
 * @class OzoneCommonService
 * @constructor
 */
var OzoneCommonService = [function() {
    /**
     * Retrieves base URI path from Ozone client
     * @attribute amlUri
     * @public
     */
    var amlUri = Ozone.utils.murl("amlUrl");
    /**
     * Flag set in Ozone API that determines whether components are visible in AppsMall
     * @attribute allowComponents
     * @public
     */
    var allowComponents = Ozone.config().getClientProperty('allowComponents');

    return {
        // see above comment
        allowComponents: allowComponents,
        // see above comment
        amlBaseUri: amlUri,
        /**
         * Get full URI from relative URI path passed in
         * @method getAmlUri
         * @param relativePath {String} the relative path for an app URI
         * @returns {String} the full URI
         */
        getAmlUri: function(relativePath) {
            // refactor if characters that need to be escaped (ex. space characters to '%20') become an issue.
            if (amlUri.endsWith('/')) {
                return (amlUri + relativePath);
            }
            else {
                return (amlUri + '/' + relativePath);
            }
        }
    };
}];

servicesModule.factory('OzoneCommon', OzoneCommonService);
