'use strict';

servicesModule.factory('App', function($q) {
    return {
        save: function(app, context) { 
            var deferred = $q.defer();
            // call save function (create or update, depending on whether _id exists)
            if (app._id) {
                Ozone.Service("Apps").update(app, function() {
                     deferred.resolve.apply(this, arguments);
                }, context);
            }
            else {
                Ozone.Service("Apps").create(app, function() {
                     deferred.resolve.apply(this, arguments);
                }, context);
            }
            return deferred.promise;
        },
        query: function(selector, context) {
            var deferred = $q.defer();
            Ozone.Service("Apps").query((selector || {}), function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        get: function(id, context) { 
            var deferred = $q.defer();
            Ozone.Service("Apps").get(id, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        delete: function(app, context) {
            var deferred = $q.defer();
            Ozone.Service("Apps").delete(app, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        remove: function(app, context) {
            var deferred = $q.defer();
            Ozone.Service("Apps").delete(app, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        }
    };
});
