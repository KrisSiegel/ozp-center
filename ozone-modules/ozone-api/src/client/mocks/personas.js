Ozone.Service("Personas", (function () {
    var personaAccessor = function (obj) {
        var persona = obj;

        return {
            get: function () {
                return persona;
            },
            getId: function () {
                return persona._id;
            },
            getViewedHelpPage: function() {
                if(Ozone.utils.safe(persona, "meta.viewedHelpPage")){
                    return persona.meta.viewedHelpPage;
                }
                return false;
            },
            setViewedHelpPage: function(boolViewedHelpPage){
                if (Ozone.utils.isUndefinedOrNull(persona.meta)) {
                    persona.meta = { };
                }
                persona.meta.viewedHelpPage = !!boolViewedHelpPage;
                Ozone.Service("Personas").persona.update(persona, function(response) { });
            },
            getPermissions: function () {
                return Ozone.utils.safe(persona, "meta.permissions");
            },
            addPermission: function (perm) {
                if (Ozone.utils.isUndefinedOrNull(persona.meta)) {
                    persona.meta = { };
                }
                if (Ozone.utils.isUndefinedOrNull(persona.meta.permissions)) {
                    persona.meta.permissions = [];
                }
                if (!Ozone.utils.isArray(perm)) {
                    perm = [perm];
                }
                persona.meta.permissions = perm;
                Ozone.Service("Personas").persona.update(persona, function(response) {

                });
            },
            removePermission: function (perm) {
                if (Ozone.utils.isUndefinedOrNull(Ozone.utils.safe(persona, "meta.permissions"))) {
                    throw "No permissions to remove";
                } else {
                    persona.meta.permissions.splice(persona.meta.permissions.indexOf(perm), 1);
                    Ozone.Service("Personas").persona.update(persona, function(response) {

                    });
                }
            },
            removeAllPermissions: function (delaySave) {
                persona.meta.permissions = [];
                if (!delaySave) {
                    Ozone.Service("Personas").persona.update(persona, function(response) {

                    });
                }
            },
            hasPermission: function (perm) {
                return ((Ozone.utils.safe(persona, "meta.permissions") || []).indexOf(perm) !== -1);
            },
            getRoles: function (perm) {
                return Ozone.utils.safe(persona, "meta.role");
            },
            getUsername: function () {
                return persona.username;
            },
            getFavoriteApps: function () {
                return (persona.meta || { }).favoriteApps;
            },
            addFavoriteApp: function (favoriteApp, callback) {
                if (Ozone.utils.isUndefinedOrNull(favoriteApp)) {
                    throw "No favoriteApp defined";
                }

                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }

                persona.meta = persona.meta || { };
                persona.meta.favoriteApps = persona.meta.favoriteApps || [ ];
                if (persona.meta.favoriteApps.indexOf(favoriteApp) !== -1){
                    // current favoriteApps already has this favoriteApp, no need to add it again.
                    return callback(persona.meta.favoriteApps);
                }

                persona.meta.favoriteApps.push(favoriteApp);

                // the update method will update both the session object & the db.
                Ozone.Service("Personas").persona.update(persona, function(response) {
                    return callback(response.getFavoriteApps());
                });
            },
            removeFavoriteApp: function (favoriteApp, callback) {
                if (Ozone.utils.isUndefinedOrNull(favoriteApp)) {
                    throw "No favoriteApp defined";
                }

                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }

                var favoriteApps = (persona.meta || { }).favoriteApps;
                if (favoriteApps === undefined || Ozone.utils.indexOf(favoriteApps, favoriteApp) == -1){
                    return callback(favoriteApps);
                }

                Ozone.utils.removeFromArray(favoriteApps, favoriteApp);

                // the update method will update both the session object & the db.
                Ozone.Service("Personas").persona.update(persona, function(response) {
                    return callback(response.getFavoriteApps());
                });
            },
            getLaunchedApps: function () {
                return (persona.meta || { }).launchedApps;
            },
            getLaunchedAppsArray: function () {
                var launchedApps = this.getLaunchedApps() || { },
                    array = [ ];
                for (var appShortName in launchedApps) {
                    if (launchedApps.hasOwnProperty(appShortName)) {
                        array.push([appShortName, launchedApps[appShortName]]);
                    }
                }

                return array;
            },
            addLaunchedApp: function (launchedApp, callback) {
                if (!Ozone.utils.isObject(launchedApp)) {
                    throw "No launchedApp defined";
                }

                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }

                persona.meta = persona.meta || { };
                persona.meta.launchedApps = persona.meta.launchedApps || { };
                var launchedApps = persona.meta.launchedApps;
                launchedApps[launchedApp.appShortName] = launchedApp.dateTime;

                // the update method will update both the session object & the db.
                Ozone.Service("Personas").persona.update(persona, function(response) {
                    return callback(response.getLaunchedApps());
                });
            },
            setProfileImage: function (fileId, callback) {
                if (Ozone.utils.isUndefinedOrNull(fileId)) {
                    throw "Invalid fileId";
                }

                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }

                persona.meta = persona.meta || { };
                persona.meta.profileImageId = fileId;
                Ozone.Service("Personas").persona.update(persona, function(response) {
                    return callback(response);
                });
            },
            getCollections: function (id) {
                var collections = (persona.meta || { }).collections || [ ];
                if (Ozone.utils.isUndefinedOrNull(id)) {
                    return collections;
                }

                return Ozone.utils.getFromArrayWithField(collections, "id", id);
            },
            setCollection: function (id, collection, callback) { // create or update
                if (Ozone.utils.isUndefinedOrNull(callback)) { // create
                    callback = collection;
                    collection = id;
                    id = null;
                }

                if (Ozone.utils.isUndefinedOrNull(collection)) {
                    throw "No collection defined";
                }
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }

                persona.meta = persona.meta || { };
                persona.meta.collections = persona.meta.collections || [ ];
                var collections = persona.meta.collections;

                var theCollection = this.getCollections(id);
                if (!Ozone.utils.isUndefinedOrNull(id) && theCollection !== undefined && Ozone.utils.isObject(theCollection)) {
                    // update
                    theCollection.label = collection.label;
                    theCollection.apps = collection.apps;
                } else {
                    // create
                    collection.id = id || Ozone.utils.generateId();
                    collections.push(collection);
                }

                // the update method will update both the session object & the db.
                Ozone.Service("Personas").persona.update(persona, function(response) {
                    return callback(response.getCollections());
                });
            },
            removeCollection: function (id, callback) {
                if (Ozone.utils.isUndefinedOrNull(id)) {
                    throw "No id defined";
                }

                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }

                var collections = (persona.meta || { }).collections;
                if (collections === undefined) {
                    return callback(collections);
                }

                Ozone.utils.removeFromArrayWithField(collections, "id", id);

                // the update method will update both the session object & the db.
                Ozone.Service("Personas").persona.update(persona, function(response) {
                    return callback(response.getCollections());
                });
            }
        };
    };

    var api = {
        getServicePath: function () {
            return Ozone.utils.murl("apiBaseUrl", "/personas/");
        },
        persona: {
            envelop: function (obj) {
                return personaAccessor(obj);
            },
            getCurrent: function (callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }

                var url = api.getServicePath() + "persona/current/";

                //---  Ozone.ajax replacement code ---//
                var currentPersona = Ozone.mockDb.getSingleRecord('CurrentPersona', 'null');
                return callback.apply((context || this), [personaAccessor(currentPersona)]);
                //---  Ozone.ajax replacement code ---//
            },
            //---  MOCK ONLY -- NEED UPDATE CURRENT METHOD FOR TESTS ---//
            updateCurrent: function (data, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (!Ozone.utils.isObject(data)) {
                    throw "No data defined";
                }

                //---  Ozone.ajax replacement code ---//
                var updatedPersona = Ozone.mockDb.update('CurrentPersona', data, 'null');
                if (updatedPersona) {
                    return callback.apply((context || this), [personaAccessor(updatedPersona)]);
                }
                //---  Ozone.ajax replacement code ---//
            //---  MOCK ONLY -- NEED UPDATE CURRENT METHOD FOR TESTS ---//
            },
            update: function (persona, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (!Ozone.utils.isObject(persona)) {
                    throw "No persona defined";
                }

                //---  Ozone.ajax replacement code ---//
                var updatedPersona = Ozone.mockDb.update('Personas', persona, 'null');
                if (updatedPersona) {
                    var currentPersona = Ozone.mockDb.getSingleRecord('CurrentPersona', 'null');
                    if (currentPersona.username === updatedPersona.username) {
                        Ozone.mockDb.update('CurrentPersona', persona, 'null');
                    }
                    return callback.apply((context || this), [personaAccessor(updatedPersona)]);
                }
                //---  Ozone.ajax replacement code ---//
            },
            getPersonaById: function (userId, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (Ozone.utils.isUndefinedOrNull(userId)) {
                    throw "No userId defined";
                }

                var url = api.getServicePath() + "persona/" + userId;

                //---  Ozone.ajax replacement code ---//
                var persona = Ozone.mockDb.getSingleRecord('Personas', userId);
                return callback.apply((context || this), [persona]);
                //---  Ozone.ajax replacement code ---//
            },
            query: function (selector, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (!Ozone.utils.isObject(selector)) {
                    throw "No selector defined";
                }

                // currently, available fields for query are: userId, username, auth_token, auth_service.
                var queryObj = {};
                if (selector.userId) {
                    queryObj.userId = selector.userId;
                }
                if (selector.username) {
                    queryObj.username = selector.username;
                }
                if (selector.auth_token) {
                    queryObj.auth_token = selector.auth_token;
                }
                if (selector.auth_service) {
                    queryObj.auth_service = selector.auth_service;
                }

                var url = api.getServicePath() + "persona/";

                //---  Ozone.ajax replacement code ---//
                var personaResults = Ozone.mockDb.query('Personas', queryObj);
                return callback.apply((context || this), [personaResults]);
                //---  Ozone.ajax replacement code ---//
            },
            create: function (data, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (!Ozone.utils.isObject(data)) {
                    throw "No data defined";
                }

                var url = api.getServicePath() + "persona/";

                //---  Ozone.ajax replacement code ---//
                var createdPersona = Ozone.mockDb.create('Personas', data);
                if (createdPersona) {
                    return callback.apply((context || this), [createdPersona]);
                }
                //---  Ozone.ajax replacement code ---//
            },
            del: function (userId, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (Ozone.utils.isUndefinedOrNull(userId)) {
                    throw "No userId defined";
                }

                var url = api.getServicePath() + "persona/" + userId;

                //---  Ozone.ajax replacement code ---//
                var isDeleted = Ozone.mockDb.delete('Personas', userId);
                if (isDeleted) {
                    return callback.apply((context || this), [app]);
                }
                //---  Ozone.ajax replacement code ---//
            }
        },
        permissions: {
            get: function (permissionId, callback) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (Ozone.utils.isUndefinedOrNull(permissionId)) {
                    throw "No permissionId defined";
                }

                var url = api.getServicePath() + "permission/" + permissionId;

                //---  Ozone.ajax replacement code ---//
                var personaPermission = Ozone.mockDb.getSingleRecord('PersonaPermissions', permissionId);
                return callback.apply((context || this), [personaPermission]);
                //---  Ozone.ajax replacement code ---//
            },
            query: function (selector, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (!Ozone.utils.isObject(selector)) {
                    //throw "No selector defined";
                }

                // Currently no selectors! har har
                var queryObj = {};
                if (selector && selector.designation) {
                    queryObj.designation = selector.designation;
                }

                var url = api.getServicePath() + "permission/";

                //---  Ozone.ajax replacement code ---//
                var personaPermissionResults = Ozone.mockDb.query('PersonaPermissions', queryObj);
                return callback.apply((context || this), [personaPermissionResults]);
                //---  Ozone.ajax replacement code ---//
            }
        },
        roles: {
            get: function (id, callback) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (Ozone.utils.isUndefinedOrNull(id)) {
                    throw "No roleId defined";
                }

                var url = api.getServicePath() + "role/" + id;

                //---  Ozone.ajax replacement code ---//
                var personaRole = Ozone.mockDb.getSingleRecord('PersonaRoles', id);
                return callback.apply((context || this), [personaRole]);
                //---  Ozone.ajax replacement code ---//
            },
            query: function (selector, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (!Ozone.utils.isObject(selector)) {
                    //throw "No selector defined";
                }

                // Currently no selectors! har har
                var queryObj = {};
                if (selector && selector.designation) {
                    queryObj.designation = selector.designation;
                }

                var url = api.getServicePath() + "role/";

                //---  Ozone.ajax replacement code ---//
                var personaRoleResults = Ozone.mockDb.query('PersonaRoles', queryObj);
                return callback.apply((context || this), [personaRoleResults]);
                //---  Ozone.ajax replacement code ---//
            }
        }
    };

    // Support of IE8 and it's terrible understanding of ECMAScript
    api["delete"] = api.del;

    // For backward compatability ONLY
    // TODO: Drop this
    for (var method in api.persona) {
        if (api.persona.hasOwnProperty(method)) {
            (function (api, method) {
                api[method] = function () {
                    Ozone.logger.warning("Ozone.Service('Personas')." + method + "() is deprecated; use Ozone.Service('Personas').persona." + method + "() instead");
                    api.persona[method].apply(this, Array.prototype.slice.call(arguments, 0));
                }
            }(api, method));
        }
    }

    return api;

}()));
