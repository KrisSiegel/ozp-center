/**
 * Service object for accessing persona data through the Ozone API
 *
 * @module servicesModule
 * @submodule PersonaModule
 * @requires amlApp.services
 */

'use strict';

/**
 * @class PersonaService
 * @static
 */ 

/**
 * @class PersonaService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 */
var PersonaService = ['$q', function($q) {

    // permission type lookup - used in case URI prefixes change
    var permissionTypes = {
        Tags: "/Ozone/Apps/App/AppsMall/Manage/Tags/",
        Collections: "/Ozone/Apps/App/AppsMall/Manage/Collections/",
        Categories: "/Ozone/Apps/App/AppsMall/Manage/Categories/",
        ApproveOrganizationOnlyApplication: "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectOrganizationOnlyApplication/",
        ApproveMallWideApplication: "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectMallWideApplication/",
        SubmitApplication: "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/",
        GrantPermission: "/Ozone/Apps/App/AppsMall/GrantPermission/"
    };

    var personaHasPermission = function(permissionNameOrUri, persona) {
        // get permission URI, either from management permission lookup or passed in directly.
        var permissionUri = ((_.has(permissionTypes, permissionNameOrUri)) ? permissionTypes[permissionNameOrUri] : permissionNameOrUri);

        // if persona and permission URI are both valid, then perform permission lookup (or return false otherwise)
        if (permissionUri && _.isObject(persona) && _.isFunction(persona.hasPermission)) {
            return persona.hasPermission(permissionUri);
        }
        return false;
    };
    var viewedHelpPage = function(persona){
        if (_.isObject(persona) && _.isFunction(persona.getViewedHelpPage)){
            return persona.getViewedHelpPage();
        }
        return false;
    };
    var setViewedHelpPage = function(boolViewedHelpPage){
        getCurrentPersona().then(function(persona){
            if (_.isObject(persona) && _.isFunction(persona.setViewedHelpPage)){
                return persona.setViewedHelpPage(!!boolViewedHelpPage);
            }
        });
    };
    var getCurrentPersona = function() {
        var deferred = $q.defer();
        Ozone.Service('Personas').persona.getCurrent(function(persona) {
            deferred.resolve(persona);
        });
        return deferred.promise;
    };

    return {
        // Checks permission, and invokes then clause of promise if hasPermission() returns true.
        // Persona can either be passed in as second parameter, or left blank -- if blank, then current persona will be used.
        checkPermission: function(permissionNameOrUri, persona) {
            var deferred = $q.defer();
            if (_.isObject(persona) && _.isFunction(persona.hasPermission)) {
                if (personaHasPermission(permissionNameOrUri, persona)) {
                    deferred.resolve();
                }
                else {
                    $q.reject();
                }
            }
            else {
                getCurrentPersona().then(function(currentPersona) {
                    if (personaHasPermission(permissionNameOrUri, currentPersona)) {
                        deferred.resolve();
                    }
                    else {
                        $q.reject();
                    }
                })
            }
            return deferred.promise;
        },
        queryPersona: function(querySelector) {
            var deferred = $q.defer();
            Ozone.Service('Personas').persona.query(querySelector, function(personaResults) {
                deferred.resolve(personaResults);
            });
            return deferred.promise;
        },
        getCurrentPersona: getCurrentPersona,
        setCurrentPersona: function(persona) {
            var deferred = $q.defer();
            Ozone.Service('Personas').persona.updateCurrent(persona, function() {
                deferred.resolve.apply(this, arguments);
            });
            return deferred.promise;
        },
        getCurrentPersonaData: function() {
            var deferred = $q.defer();
            Ozone.Service('Personas').persona.getCurrent(function(persona) {
                if (!persona.get()) {
                    console.log('>>> PERSONA ERROR');
                    $q.reject();
                }
                if (_.isFunction(persona.getUsername)) {
                    var roles = persona.getRoles();
                    var permissions = persona.getPermissions();
                    var personaData = {
                        id: persona.getId(),
                        username: persona.getUsername(),
                        roles: roles || [],
                        permissions: permissions || [],
                        favoriteApps: persona.getFavoriteApps() || [],
                        launchedApps: persona.getLaunchedApps() || [],
                        hasAppManagerAccess: personaHasPermission('SubmitApplication', persona),
                        hasTagManagerAccess: personaHasPermission('Tags', persona),
                        hasCollectionManagerAccess: personaHasPermission('Collections', persona),
                        hasCategoryManagerAccess: personaHasPermission('Categories', persona),
                        hasApproveOrganizationOnlyApplicationAccess: personaHasPermission('ApproveOrganizationOnlyApplication', persona),
                        hasApproveMallWideApplicationAccess: personaHasPermission('ApproveMallWideApplication', persona),
                        hasSubmitApplicationAccess: personaHasPermission('SubmitApplication', persona),
                        hasGrantPermissionAccess: personaHasPermission('GrantPermission', persona),
                        viewedHelpPage: viewedHelpPage(persona),
                        setViewedHelpPage: setViewedHelpPage
                    };
                    deferred.resolve(personaData);
                }
                else {
                    $q.reject();
                }
            });
            return deferred.promise;
        },
        addOrRemoveFavoriteApp: function(appShortname, isAddingFavorite) {
            var deferred = $q.defer();
            Ozone.Service('Personas').persona.getCurrent(function(persona) {
                if (isAddingFavorite) {
                    persona.addFavoriteApp(appShortname, function(favoriteApps) {
                        deferred.resolve(favoriteApps);
                    });
                }
                else {
                    persona.removeFavoriteApp(appShortname, function(favoriteApps) {
                        deferred.resolve(favoriteApps);
                    });
                }
            });
            return deferred.promise;
        }
    };
}];

servicesModule.factory('Persona', PersonaService);
