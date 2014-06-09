'use strict';

servicesModule.factory('Component', function($q) {

    // return resource object if AppsMall uses components, or an empty object if AppsMall does not use components
    if (Ozone.config().getClientProperty('allowComponents')) {
        return {
            save: function(component, context) { 
                var deferred = $q.defer();
                // call save function (create or update, depending on whether _id exists)
                if (component._id) {
                    Ozone.Service("Components").update(component, function() {
                         deferred.resolve.apply(this, arguments);
                    }, context);
                }
                else {
                    Ozone.Service("Components").create(component, function() {
                         deferred.resolve.apply(this, arguments);
                    }, context);
                }
                return deferred.promise;
            },
            query: function(selector, context) {
                var deferred = $q.defer();
                Ozone.Service("Components").query((selector || {}), function() {
                    deferred.resolve.apply(this, arguments);
                }, context);
                return deferred.promise;
            },
            get: function(id, context) { 
                var deferred = $q.defer();
                Ozone.Service("Components").get(id, function() {
                    deferred.resolve.apply(this, arguments);
                }, context);
                return deferred.promise;
            },
            delete: function(component, context) { 
                var deferred = $q.defer();
                Ozone.Service("Components").delete(component, function() {
                    deferred.resolve.apply(this, arguments);
                }, context);
                return deferred.promise;
            },
            remove: function(component, context) { 
                var deferred = $q.defer();
                Ozone.Service("Components").delete(component, function() {
                    deferred.resolve.apply(this, arguments);
                }, context);
                return deferred.promise;
            }
        };
    }
    else {
        return {
            save: function(component, context) { 
                return $q.reject();
            },
            query: function(selector, context) {
                var deferred = $q.defer();
                deferred.resolve([]);
                return deferred.promise;
            },
            get: function(id, context) { 
                return $q.reject();
            },
            delete: function(component, context) { 
                return $q.reject();
            },
            remove: function(component, context) { 
                return $q.reject();
            }
        };
    }
});
