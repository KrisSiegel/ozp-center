'use strict';

servicesModule.factory('AppOrComponent', function($q, App, Component) {
    
    // set to True if AppsMall uses components; False if AppsMall does not use components.
    // If AppsMall does not use components, then App service methods will be called from this service.
    var AllowComponents = Ozone.config().getClientProperty('allowComponents');

    function setEmptySelectorToDefault(selector) {
        selector = selector || {};
        if (!AllowComponents && !selector.type) {
            selector.type = 'app';
        }
        return selector;
    }

    // get URI from app data. (TO DO: apps and components might have different URI path components.)
    function getUri(app) { 
        return ('/AppsMall/Apps/' + app.shortname); 
    }

    // True for app objects, or false for component objects.
    function isApp(appOrComponent) {
        return (appOrComponent.type === 'app');
    }

    // Wrapper methods that call App and Component Resource methods.
    // If app/component distinction cannot be deterßmined from parsing the inputs, then params.type must be 
    // set to either 'app' or 'component'.
    return {
        save: function(appOrComponent, context) { 
            return (isApp(appOrComponent) ? App.save(appOrComponent, context) : Component.save(appOrComponent, context));
        },
        query: function(selector, context) {
            selector = setEmptySelectorToDefault(selector);
            if (selector.type === 'app') {
                return App.query(selector, context);
            }
            else if (AllowComponents && (selector.type === 'component')) {
                return Component.query(selector, context);
            }
            // If designated type is empty and components are allowed, then query both and concatenate results
            else {
                var deferred = $q.defer();
                App.query(selector, context).then(function(appData) {
                    var appsAndComponents = appData;
                    Component.query(selector, context).then(function(componentData) {
                        appsAndComponents = appsAndComponents.concat(componentData);
                        deferred.resolve(appsAndComponents);
                    })
                });
                return deferred.promise;
            }
        },
        get: function(selector, context) {
            selector = setEmptySelectorToDefault(selector);
            // allow both id field formats
            if (selector._id && !selector.id) {
                selector.id = selector._id;
            }
            // redirect to App or Component service method
            if (_.isObject(selector) && selector.id) {
                // default selector type to app
                selector.type = selector.type || 'app';
                if (selector.type === 'app') {
                    return App.get(selector.id, context);
                }
                else if (selector.type === 'component') {
                    return Component.get(selector.id, context);
                }
            }
            return $q.reject();
        },
        // redirect to App or Component service method
        delete: function(appOrComponent, context) {
            return (isApp(appOrComponent) ? App.delete(appOrComponent, context) : Component.delete(appOrComponent, context));
        },
        // redirect to App or Component service method
        remove: function(appOrComponent, context) {
            return (isApp(appOrComponent) ? App.remove(appOrComponent, context) : Component.remove(appOrComponent, context));
        },
        getUri: getUri,
        AllowComponents: AllowComponents
    };
});

/*------------*/
