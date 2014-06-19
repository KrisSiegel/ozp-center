/**
 * Service object for accessing persona data through the Ozone API
 *
 * @module AppsMallUI.servicesModule
 * @submodule AppsMallUI.PersonaModule
 * @requires amlApp.services
 */

'use strict';

/**
 * @class AppsMallUI.PersonaService
 * @static
 */ 

/**
 * @class AppsMallUI.PersonaService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 */
var PersonaService = ['$q', function($q) {

    /**
     * lookup object for permission type URI - matches permissions from Ozone API
     * @attribute permissionTypes
     * @private
     */
    var permissionTypes = {
        Tags: "/Ozone/Apps/App/AppsMall/Manage/Tags/",
        Collections: "/Ozone/Apps/App/AppsMall/Manage/Collections/",
        Categories: "/Ozone/Apps/App/AppsMall/Manage/Categories/",
        ApproveOrganizationOnlyApplication: "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectOrganizationOnlyApplication/",
        ApproveMallWideApplication: "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectMallWideApplication/",
        SubmitApplication: "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/",
        GrantPermission: "/Ozone/Apps/App/AppsMall/GrantPermission/"
    };

    /**
     * lookup object for permission type URI - matches permissions from Ozone API
     * @method personaHasPermission
     * @param permissionNameOrUri {String} either a permission URI, or a permission name that corresponds to a URI.
     *        Valid permission names: "Tags", "Collections", "Categories", "ApproveOrganizationOnlyApplication", "ApproveMallWideApplication", "SubmitApplication", "GrantPermission"
     * @param persona {Object} a Persona object used for permission lookup
     * @private
     * @return {Boolean} true if Persona permission bit for permission name passed in is set to True, or false otherwise
     */
    var personaHasPermission = function(permissionNameOrUri, persona) {
        // get permission URI, either from management permission lookup or passed in directly.
        var permissionUri = ((_.has(permissionTypes, permissionNameOrUri)) ? permissionTypes[permissionNameOrUri] : permissionNameOrUri);

        // if persona and permission URI are both valid, then perform permission lookup (or return false otherwise)
        if (permissionUri && _.isObject(persona) && _.isFunction(persona.hasPermission)) {
            return persona.hasPermission(permissionUri);
        }
        return false;
    };

    /**
     * lookup object for permission type URI - matches permissions from Ozone API
     * @method viewedHelpPage
     * @param persona {Object} a Persona object used for help page lookup
     * @private
     * @return {Boolean} true if persona passed in has viewed the help page
     */
    var viewedHelpPage = function(persona) {
        if (_.isObject(persona) && _.isFunction(persona.getViewedHelpPage)){
            return persona.getViewedHelpPage();
        }
        return false;
    };

    /**
     * lookup object for permission type URI - matches permissions from Ozone API
     * @method setViewedHelpPage
     * @param boolViewedHelpPage {Boolean} "has help page been viewed?" flag to get set
     * @private 
     * @return {PromiseObject} that, when invoked, passes the viewed help page boolean flag
     */
    var setViewedHelpPage = function(boolViewedHelpPage) {
        getCurrentPersona().then(function(persona){
            if (_.isObject(persona) && _.isFunction(persona.setViewedHelpPage)){
                return persona.setViewedHelpPage(!!boolViewedHelpPage);
            }
        });
    };

    /**
     * Retrieves a Persona object from the currently logged-in user
     * @method getCurrentPersona
     * @public 
     * @return {PromiseObject} that, when invoked, passes a Persona object from the currently logged-in user as a parameter
     */
    var getCurrentPersona = function() {
        var deferred = $q.defer();
        Ozone.Service('Personas').persona.getCurrent(function(persona) {
            deferred.resolve(persona);
        });
        return deferred.promise;
    };

    return {
        /**
         * Performs permission check, and returns invokable Angular promise if permission bit equals true
         * @method checkPermission
         * @param permissionNameOrUri {String} either a permission URI, or a permission name that corresponds to a URI.
         *        Valid permission names: "Tags", "Collections", "Categories", "ApproveOrganizationOnlyApplication", "ApproveMallWideApplication", "SubmitApplication", "GrantPermission"
         * @param persona {Object} a Persona object used for permission lookup.  If empty, then the current persona will be used.
         * @public 
         * @return {PromiseObject} that can only be invoked if the user has the permission flag passed in set to True.  This promise does not pass any parameters into the then() call.
         */
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
        /**
         * Queries for Persona objects based on the query parameters passed in
         * @method checkPermission
         * @param permissionNameOrUri {String} either a permission URI, or a permission name that corresponds to a URI.
         *        Valid permission names: "Tags", "Collections", "Categories", "ApproveOrganizationOnlyApplication", "ApproveMallWideApplication", "SubmitApplication", "GrantPermission"
         * @param persona {Object} a Persona object used for permission lookup.  If empty, then the current persona will be used.
         * @public 
         * @return {PromiseObject} that, when invoked, passes an array of Persona objects based on query results as a parameter
         */
        queryPersona: function(querySelector) {
            var deferred = $q.defer();
            Ozone.Service('Personas').persona.query(querySelector, function(personaResults) {
                deferred.resolve(personaResults);
            });
            return deferred.promise;
        },
        // See method above
        getCurrentPersona: getCurrentPersona,
        /**
         * Saves Persona object passed in to the database.
         * @method setCurrentPersona
         * @param persona {Object} the Persona object to save
         * @public 
         * @return {PromiseObject} that, when invoked, passes Persona object from currently logged-in user as a parameter
         */
        setCurrentPersona: function(persona) {
            var deferred = $q.defer();
            Ozone.Service('Personas').persona.updateCurrent(persona, function() {
                deferred.resolve.apply(this, arguments);
            });
            return deferred.promise;
        },
        /**
         * Retrieves the Persona object from the currently logged-in user, then creates data object with results from all permission flags method calls
         * @method getCurrentPersonaData
         * @public 
         * @return {PromiseObject} that, when invoked, passes data object with permission flag calls as a parameter 
         */
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
        /**
         * Sets the Favorite flag from the Persona object of the currently logged-in user.
         * @method getCurrentPersonaData
         * @param appShortname {String} shortname of app to save Favorite flag
         * @param isAddingFavorite {Boolean} value of Favorite flag to be set on Persona object
         * @public
         * @return {PromiseObject} that, when invoked, passes new favorite flag value as a parameter
         */
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
