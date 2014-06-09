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
    var amlUri = Ozone.utils.murl("amlUrl");
    var allowComponents = Ozone.config().getClientProperty('allowComponents');

    return {
        allowComponents: allowComponents,
        amlBaseUri: amlUri,
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
