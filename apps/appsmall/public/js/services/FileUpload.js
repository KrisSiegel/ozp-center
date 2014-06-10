/**
 * Service object for handling file uploads and retrieving URLs of previously uploaded files
 *
 * @module servicesModule
 * @submodule FileUploadModule
 * @requires amlApp.services
 */

'use strict';

// file upload service
var defaultImageTypes = {
    icon: Ozone.utils.murl("amlUrl", '/img/app-icon-not-available-hires.png'),
    smallBanner: Ozone.utils.murl("amlUrl", '/img/banner-sml-not-available-hires.png'),
    featuredBanner: Ozone.utils.murl("amlUrl", '/img/banner-lg-not-available-hires.png'),
};

/**
 * @class FileUploadService
 * @static
 */ 

/**
 * @class FileUploadService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 */
var FileUploadService = ['$q', function ($q) {
    return {
        /**
         * @method upload
         * @param fileObject {File} a File object containing an uploaded image, as defined by the [HTML5 File API](http://www.w3.org/TR/FileAPI/) 
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return Angular promise that returns an acknowledgement object if successful that contains the newly generated id, or an error object if unsuccessful.
         */
        upload: function(fileObject, context) {
            var deferred = $q.defer();
            Ozone.Service("Persistence").Store("apps").Drive("images").set('null', fileObject, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        /**
         * @method getFileUrl
         * @param id {String} the UUID (unique identifier) of the image, as assigned by the server
         * @param type {String} the App attribute, used to retrieve the default image if the id does not match an existing image
         * @return {String} the URL of the image that corresponds to the id passed in (if found), or a static image if the id was not found.
         */
        getFileUrl: function(id, type) {
            // if hex id was passed in, then get persistence image
            if (/^[0-9a-fA-F]+$/.test(id)) {
                return Ozone.Service("Persistence").Store("apps").Drive("images").getDrivePath(id);
            } else {
                type = type || 'icon';
                return defaultImageTypes[type];
            }
        }
    };
}];

servicesModule.factory('FileUpload', FileUploadService);
