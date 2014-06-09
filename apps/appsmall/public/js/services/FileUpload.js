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
        upload: function(fileObject, context) {
            var deferred = $q.defer();
            Ozone.Service("Persistence").Store("apps").Drive("images").set('null', fileObject, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
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
