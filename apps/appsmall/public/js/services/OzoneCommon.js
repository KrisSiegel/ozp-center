'use strict';

servicesModule.factory('OzoneCommon', function() {

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
});
