'use strict';

// file upload service
servicesModule.factory('FileUpload', function($q) {

    var defaultImageTypes = {
        icon: Ozone.utils.murl("amlUrl", '/img/app-icon-not-available-hires.png'),
        smallBanner: Ozone.utils.murl("amlUrl", '/img/banner-sml-not-available-hires.png'),
        featuredBanner: Ozone.utils.murl("amlUrl", '/img/banner-lg-not-available-hires.png'),
    };

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
})
