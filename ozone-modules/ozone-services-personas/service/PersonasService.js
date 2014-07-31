/**
    The Personas serivce allows access to manage users, permissions and roles.

    @module Ozone.Services.Personas
    @module Ozone.Services.Personas
    @submodule Server-Side
*/
(function () {
    var constants = require('../config/constants'),
    	store = constants.database.store.personas,
    	collection = constants.database.collection.persona,
        roles = constants.database.collection.roles,
        permissions = constants.database.collection.permissions,
        containerConfigDir = '../../../config/',
        Ozone = null,
        Persistence = null,
        cachedPermissionsAndRoles = {
            permissions: undefined,
            roles: undefined
        },
        logger = null;

    var async = require("async");

    var createCacheForPermissionsAndRoles = function (callback) {
        var execQueue = [];
        execQueue.push(function (cb) {
            exporting.permissions.query({}, function (err, results) {
                cachedPermissionsAndRoles.permissions = results;
                cb.apply(this, []);
            })
        });
        execQueue.push(function (cb) {
            exporting.roles.query({}, function (err, results) {
                cachedPermissionsAndRoles.roles = results;
                cb.apply(this, []);
            })
        });
        async.parallel(execQueue, (callback || function () {}));
    };

    var getPermissionsFromCachedRole = function (role) {
        for (var i = 0; i < cachedPermissionsAndRoles.roles.length; ++i) {
            console.log(role);
            if (cachedPermissionsAndRoles.roles[i].role.toLowerCase() === role.toLowerCase()) {
                return cachedPermissionsAndRoles.roles[i].permissions;
            }
        }
        return [];
    }

    var importRecords = function (filePathArray, configDir, callback) {
        configDir = configDir || containerConfigDir;
        for (var i = 0; i < filePathArray.length; i++) {
            var filePath = __dirname + '/' + configDir + filePathArray[i];

            logger.debug("Personas Service --> Import --> filePath: " + filePath);

            // currently only supporting json files
            var data = require(filePath);

            if (!Ozone.Utils.isUndefinedOrNull(data)) {
                if (Ozone.Utils.safe(data, "Personas")) {
                    for (var j = 0; j < data.Personas.length; ++j) {
                        var person = data.Personas[j];
                        (function (username, auth, token, permissions, favoriteApps, launchedApps) {
                            exporting.persona.create({
                                username: username,
                                auth_service: auth,
                                auth_token: token,
                                meta: {
                                    permissions: permissions,
                                    favoriteApps: favoriteApps,
                                    launchedApps: launchedApps
                                }
                            }, function () {

                            });
                        }(person.username, person.auth_service, person.auth_token, Ozone.utils.safe(person, "meta.permissions"), Ozone.utils.safe(person, "meta.favoriteApps"), Ozone.utils.safe(person, "meta.launchedApps")));
                    }
                }
                if (Ozone.Utils.safe(data, "Permissions")) {
                    for (var key in data.Permissions) {
                        if (data.Permissions.hasOwnProperty(key)) {
                            var d = new Date();
                            (function (key, desc, rank, label, designation, createdBy, createdOn, lastModified) {
                                exporting.permissions.create({
                                    permission: key,
                                    label: label,
                                    description: desc,
                                    designation: designation,
                                    rank: rank,
                                    createdBy: createdBy,
                                    createdOn: createdOn,
                                    lastModified: lastModified
                                }, function () {

                                });
                            }(key, data.Permissions[key].description, data.Permissions[key].rank, data.Permissions[key].label, data.Permissions[key].designation, data.Permissions[key].createdBy, d, d));
                        }
                    }
                }
                if (Ozone.Utils.safe(data, "Roles")) {
                    for (var key in data.Roles) {
                        if (data.Roles.hasOwnProperty(key)) {
                            var d = new Date();
                            (function (key, desc, rank, label, perms, designation, createdBy, createdOn, lastModified) {
                                exporting.roles.create({
                                    role: key,
                                    label: label,
                                    description: desc,
                                    designation: designation,
                                    rank: rank,
                                    permissions: perms,
                                    createdBy: createdBy,
                                    createdOn: createdOn,
                                    lastModified: lastModified
                                }, function () {

                                });
                            }(key, data.Roles[key].description, data.Roles[key].rank, data.Roles[key].label, data.Roles[key].permissions, data.Roles[key].designation, data.Roles[key].createdBy, d, d));
                        }
                    }
                }
            }
        }
    };

    var exporting = {
        /**
            Initializes the Personas Service

            @method init
            @param {Object} _ozone the Ozone API object
        */
    	init: function (_ozone) {
    			Ozone = _ozone;
    			logger = Ozone.logger;
                Ozone.Service().on("ready", "Persistence", function () {
                    Persistence = Ozone.Service('Persistence');
                    createCacheForPermissionsAndRoles(function () {});
                });
    	},
        persona: {
            /**
                Deletes the currently authenticated user within the session. This should be called from a security service.

                @method persona.logout
                @param {Object} req the http request object
                @param {Object} res the http response object
                @param {Method} next the next method to continue routing
            */
            logout: function (req, res, next) {
                delete req.session.user;
            },
            /**
                Logs a persona into the current session. This should be called from a security service.

                @method persona.login
                @param {Object} obj the persona object to log into the system
                @param {Object} req the http request object
                @param {Object} res the http response object
                @param {Method} next the next method to continue routing
            */
            login: function (obj, req, res, next) {
                createCacheForPermissionsAndRoles(function () {
                    var personaName = Ozone.utils.safe(obj, "username");
                    var personaAuthToken = Ozone.utils.safe(obj, "auth_token");
                    var personaAuthService = Ozone.utils.safe(obj, "auth_service");
                    var personaRole = Ozone.utils.safe(obj, "overriding_role");
                    var personaPermissions = Ozone.utils.safe(obj, "overriding_permissions");
                    var canCreatePersona = Ozone.utils.safe(obj, "ensure");
                    var personaFavorites = Ozone.utils.safe(obj, "overriding_favorites");
                    var personaRecentLaunches = Ozone.utils.safe(obj, "overriding_recent_launches");
                    var newUserRole = Ozone.config().getServerProperty("security.newUserRole");
                    var firstNewUserRole = Ozone.config().getServerProperty("security.firstNewUserRole");

                    var applyPermissions = function (persona, isFirst) {
                        if (Ozone.utils.safe(persona, "meta") === undefined) {
                            persona.meta = { };
                        }

                        if (Ozone.utils.isUndefinedOrNull(persona.meta.permissions) && Ozone.utils.isUndefinedOrNull(persona._id)) {
                            // New persona; set default permission scheme.
                            if (isFirst) {
                                persona.meta.permissions = getPermissionsFromCachedRole(firstNewUserRole);
                            } else {
                                persona.meta.permissions = getPermissionsFromCachedRole(newUserRole);
                            }
                        }

                        if (!Ozone.utils.isUndefinedOrNull(personaRole) && cachedPermissionsAndRoles.roles.length > 0) {
                            for (var i = 0; i < cachedPermissionsAndRoles.roles.length; ++i) {
                                if (cachedPermissionsAndRoles.roles[i].role === personaRole) {
                                    persona.meta.permissions = getPermissionsFromCachedRole(personaRole);
                                    break;
                                }
                            }
                        }

                        if (!Ozone.utils.isUndefinedOrNull(personaPermissions) && personaPermissions.length > 0) {
                            persona.meta.permissions = personaPermissions;
                        }

                        persona.meta.role = personaRole || exporting.roles.calculateSync(persona.meta.permissions);

                        return persona;
                    };

                    var updatePersona = function (persona, isFirst) {
                        if (Ozone.utils.safe(persona, "meta") === undefined) {
                            persona.meta = { };
                        }

                        applyPermissions(persona, isFirst);

                        if (!Ozone.utils.isUndefinedOrNull(personaFavorites)) {
                            persona.meta.favoriteApps = personaFavorites;
                        }

                        if (!Ozone.utils.isUndefinedOrNull(personaRecentLaunches)) {
                            persona.meta.launchedApps = personaRecentLaunches;
                        }

                        return persona;
                    };

                    exporting.persona.query({
                        username: personaName,
                        auth_token: personaAuthToken,
                        auth_service: personaAuthService
                    }, function (err, result) {
                        if (result.length === 1) {
                            var personaObj = updatePersona(result[0] || { });

                            req.session.user = {
                                persona: personaObj
                            };

                            if (!Ozone.utils.isUndefinedOrNull(obj.success)) {
                                obj.success.apply(this, [personaObj]);
                            };

                        } else {
                            exporting.persona.query({}, function (errCheck, resultCheck) {
                                if (canCreatePersona) {
                                    var personaObj = {
                                        username: personaName,
                                        auth_token: personaAuthToken,
                                        auth_service: personaAuthService,
                                        meta: { }
                                    };
                                    personaObj = updatePersona(personaObj, !(resultCheck.length > 0));
                                    exporting.persona.create(personaObj, function (errCreate, resultCreate) {
                                        req.session.user = {
                                            persona: resultCreate[0]
                                        };

                                        if (!Ozone.utils.isUndefinedOrNull(obj.success)) {
                                            obj.success.apply(this, [resultCreate]);
                                        };
                                    });
                                } else {
                                    if (!Ozone.utils.isUndefinedOrNull(obj.error)) {
                                        obj.error.apply(this, [errCheck]);
                                    };
                                }
                            });
                        }
                    });
                });
            },
            /**
                @method persona.getById
                @param {String} userId the user id to fetch
                @param {Method} callback the callback to execute upon completion
            */
            getById: function(userId, callback) {
                Persistence.Store(store).Collection(collection).get(userId, function (err, result) {
                    exporting.roles.calculate(result[0].meta.permissions, function (role) {
                        result[0].meta.role = role;
                        callback(err, result);
                    });
                });
            },
            /**
                @method persona.hasPermission
                @param {Object} persona the persona to check
                @param {Array} permission the single or multiple permissions to check
            */
            hasPermission: function(persona, permission) {
                logger.debug("Personas Service -> hasPermission -> permission: " + permission);
                logger.debug("Personas Service -> hasPermission -> persona's permissions: " + Ozone.utils.safe(persona, "meta.permissions"));
                var permsToCheck;
                if (!Ozone.utils.isArray(permission)) {
                    permsToCheck = [permission];
                } else {
                    permsToCheck = permission;
                }
                var has = true;
                var personaPerms = (Ozone.utils.safe(persona, "meta.permissions") || []);
                for (var i = 0; i < permsToCheck.length; ++i) {
                    if (personaPerms.indexOf(permission[i]) === -1) {
                        has = false;
                        break;
                    }
                }
                return has;
            },
            /**
                @method persona.query
                @param {Object} selector the selector to use when querying for persona objects
                @param {Method} callback the callback to be executed upon completion
            */
            query: function(selector, callback) {
                Persistence.Store(store).Collection(collection).query(selector, function (err, result) {
                    var applyRole = function (index) {
                        result[index].meta.role = exporting.roles.calculateSync(result[index].meta.permissions);
                    }
                    for (var i = 0; i < result.length; ++i) {
                        applyRole(i);
                    }
                    callback(err, result);
                });
            },
            /**
                @method persona.create
                @param {Object} data the persona object to create
                @param {Method} callback the callback to execute upon creation
            */
            create: function(persona, callback) {
                if (!Ozone.utils.isUndefinedOrNull(persona) && !Ozone.utils.isUndefinedOrNull(persona.meta) && !Ozone.utils.isUndefinedOrNull(persona.meta.role)) {
                    delete persona.meta.role;
                }
                Persistence.Store(store).Collection(collection).set(null, persona, function (err, result) {
                    var applyRole = function (index) {
                        result[i].meta.role = exporting.roles.calculateSync(result[i].meta.permissions);
                    }
                    for (var i = 0; i < result.length; ++i) {
                        applyRole(i);
                    }
                    callback(err, result);
                });
            },
            /**
                Updates a persona

                @method persona.update
                @param {Object} persona the persona object to update
                @param {Method} callback the callback to execute upon completion
            */
            update: function(personaId, persona, callback) {
                delete persona.meta.role;
                Persistence.Store(store).Collection(collection).set(personaId, persona, function (err, result) {
                    persona.meta.role = exporting.roles.calculateSync((persona.meta.permissions || []));
                    callback(err, persona);
                });
            },
            /**
                @method persona.delete
                @param {String} userId the user id to delete
                @param {Method} callback the callback to execute upon deletion
            */
            delete: function(userId, callback) {
                Persistence.Store(store).Collection(collection).remove(userId, function (err, result) {
                    callback(err, result.removed);
                });
            }
        },
        permissions: {
            /**
                @method permissions.getById
                @param {String} permissionId the permission id to fetch
                @param {Method} callback the callback to execute upon completion
            */
            getById: function(permissionId, callback) {
                Persistence.Store(store).Collection(permissions).get(permissionId, function (err, result) {
                    callback(err, result);
                });
            },
            /**
                @method permissions.query
                @param {Object} selector the selector to use when querying permissions
                @param {Method} callback the callback to execute upon completion
            */
            query: function(selector, callback) {
                Persistence.Store(store).Collection(permissions).query(selector, function (err, result) {
                    callback(err, result);
                });
            },
            /**
                @method permissions.create
                @param {String} permission the permission to store
                @param {Method} callback the callback to execute upon completion
            */
            create: function(permission, callback) {
                Persistence.Store(store).Collection(permissions).set(null, permission, function (err, result) {
                    callback(err, result);
                });
            },
            /**
                @method permissions.update
                @param {String} permissionId the permission's id to update
                @param {String} permission the permission to store
                @param {Method} callback the callback to execute upon completion
            */
            update: function(permissionId, permission, callback) {
                Persistence.Store(store).Collection(permissions).set(permissionId, permission, function (err, result) {
                    callback(err, result);
                });
            },
            /**
                @method permissions.delete
                @param {String} permissionId the permission's id to delete
                @param {Method} callback the callback to execute upon completion
            */
            delete: function(permissionId, callback) {
                Persistence.Store(store).Collection(permissions).remove(permissionId, function (err, result) {
                    callback(err, result.removed);
                });
            }
        },
        roles: {
            /**
                @method calculate
                @param {Array} userPermissions the user's permissions
                @param {Method} callback the callback that's executed upon completion of calculations
                @param {Array} fullPermissions (optional) the array of full permissions to use instead of the cached permissions of the system
                @param {Array} fullRoles (optional) the array of full roles to use instead of the cached roles of the system
                @param {Boolean} forceSync (optional) forces the method to return in sync rather than async
            */
            calculate: function (userPermissions, callback, fullPermissions, fullRoles, forceSync) {
                // Data should exist; run the calculations!
                var calcWithData = function (err, results) {
                    var matchingRoles = [];
                    fullRoles = fullRoles || [];
                    for (var i = 0; i < fullRoles.length; ++i) {
                        var match = true;
                        if (fullRoles[i].permissions && fullRoles[i].permissions.length <= userPermissions.length) {
                            for (var j = 0; j < fullRoles[i].permissions.length; ++j) {
                                if (userPermissions.indexOf(fullRoles[i].permissions[j]) === -1) {
                                    match = false;
                                    break;
                                }
                            }
                        } else {
                            match = false;
                        }
                        if (match) {
                            matchingRoles.push(fullRoles[i]);
                        }
                    }
                    var roleResult;
                    if (matchingRoles.length > 1) {
                        var compare = function (a, b) {
                            if (a.rank < b.rank) {
                                return -1;
                            }
                            if (a.rank > b.rank) {
                                return 1;
                            }
                            return 0;
                        }
                        matchingRoles.sort(compare);
                        roleResult = matchingRoles[0].label;
                    } else if (matchingRoles.length === 1) {
                        roleResult = matchingRoles[0].label;
                    }

                    if (Ozone.utils.isUndefinedOrNull(roleResult)) {
                        roleResult = "Custom";
                    }

                    if (callback !== undefined) {
                        callback.apply(this, [roleResult]);
                    }
                };

                // Do we have all the data we need? Let's go through each piece and gather it when necessary
                if (Ozone.utils.isNullOrUndefined(userPermissions)) {
                    callback.apply(this, []);
                    return undefined;
                }else if(userPermissions.length === 0){
                    userPermissions = [];
                }

                var execQueue = [];
                if (fullPermissions === undefined) {
                    if (cachedPermissionsAndRoles.permissions === undefined) {
                        execQueue.push(function (cb) {
                            exporting.permissions.query({}, function (err, results) {
                                fullPermissions = results;
                                cachedPermissionsAndRoles.permissions = results;
                                cb.apply(this, []);
                            })
                        });
                    } else {
                        fullPermissions = cachedPermissionsAndRoles.permissions;
                    }
                }
                if (fullRoles === undefined) {
                    if (cachedPermissionsAndRoles.roles === undefined) {
                        execQueue.push(function (cb) {
                            exporting.roles.query({}, function (err, results) {
                                fullRoles = results;
                                cachedPermissionsAndRoles.roles = results;
                                cb.apply(this, []);
                            })
                        });
                    } else {
                        fullRoles = cachedPermissionsAndRoles.roles;
                    }
                }
                if (execQueue.length > 0 && !forceSync) {
                    async.parallel(execQueue, calcWithData);
                } else {
                    calcWithData();
                }
            },
            /**
                @method calculateSync
                @param {Array} userPermissions the user's permissions
                @param {Array} fullPermissions (optional) the array of full permissions to use instead of the cached permissions of the system
                @param {Array} fullRoles (optional) the array of full roles to use instead of the cached roles of the system
            */
            calculateSync: function (userPermissions, fullPermissions, fullRoles) {
                var result;
                exporting.roles.calculate(userPermissions, function (role) {
                    result = role;
                }, fullPermissions, fullRoles, true);
                return result;
            },
            /**
                @method roles.getById
                @param {String} roleId the role's id to fetch
                @param {Method} callback the callback to execute upon completion
            */
            getById: function(roleId, callback) {
                Persistence.Store(store).Collection(roles).get(roleId, function (err, result) {
                    callback(err, result);
                });
            },
            /**
                @method roles.query
                @param {Object} selector the selector object to use when querying roles
                @param {Method} callback the callback to execute upon completion
            */
            query: function(selector, callback) {
                Persistence.Store(store).Collection(roles).query(selector, function (err, result) {
                    callback(err, result);
                });
            },
            /**
                @method roles.create
                @param {String} role the role to store
                @param {Method} callback the callback to execute upon completion
            */
            create: function(role, callback) {
                Persistence.Store(store).Collection(roles).set(null, role, function (err, result) {
                    callback(err, result);
                });
            },
            /**
                @method roles.update
                @param {String} roleId the role's id to update
                @param {String} role the role to store
                @param {Method} callback the callback to execute upon completion
            */
            update: function(roleId, role, callback) {
                Persistence.Store(store).Collection(roles).set(roleId, role, function (err, result) {
                    callback(err, result);
                });
            },
            /**
                @method roles.delete
                @param {String} roleId the role's id to delete
                @param {Method} callback the callback to execute upon completion
            */
            delete: function(roleId, callback) {
                Persistence.Store(store).Collection(roles).remove(roleId, function (err, result) {
                    callback(err, result);
                });
            }
        },
        /**
            @method import
            @param {Object} data the data to attempt to import
            @param {Method} callback the callback to execute upon completion
        */
        import: function(data, callback, path, autoImporting){
            var importReport = { persona: { successful: 0, failed: 0 }, permissions: { successful: 0, failed: 0 }, roles: { successful: 0, failed: 0 } }

            var importPersona = function (person, callback) {
                person.meta = person.meta || {}
                person.meta.permissions = person.meta.permissions || []
                person.meta.favoriteApps = person.meta.favoriteApps || []
                person.meta.launchedApps = person.meta.launchedApps || []
                person.createdOn = person.createdOn || new Date();
                person.lastModified = new Date();

                exporting.persona.query({username: person.username}, function(err, res){
                    if(err){
                        importReport.persona.failed ++;
                        if(callback){
                           callback();
                        }
                        return;
                    }
                    if(res.length > 0){
                        exporting.persona.update(res[0]._id, person, function(err){
                            if(err){
                                importReport.persona.failed ++;
                            } else {
                                importReport.persona.successful ++;
                            }
                            if(callback){
                                callback();
                            }
                        });
                    } else {
                        exporting.persona.create(person, function (err) {
                            if (err) {
                                importReport.persona.failed ++;
                            } else {
                                importReport.persona.successful ++;
                            }
                            if(callback){
                                callback();
                            }
                        });
                    }
                });
            };
            var importRole = function (role, callback) {
                role.createdOn = role.createdOn || new Date();
                role.lastModified = new Date();
                exporting.roles.query({role: role.role}, function(err, res){
                    if(err){
                        importReport.roles.failed ++;
                        if(callback){
                            callback();
                        }
                        return;
                    }
                    if(res.length > 0){
                        exporting.roles.update(res[0]._id, role, function(err){
                            if (err) {
                                importReport.roles.failed ++;
                            } else {
                                importReport.roles.successful ++;
                            }
                            if(callback){
                                callback();
                            }
                        });
                    } else {
                        exporting.roles.create(role, function (err) {
                            if (err) {
                                importReport.roles.failed ++;
                            } else {
                                importReport.roles.successful ++;
                            }
                            if(callback){
                                callback();
                            }
                        });
                    }
                });
            };
            var importPermission = function (permissionData, callback) {
                permissionData.createdOn = permissionData.createdOn || new Date();
                permissionData.lastModified = new Date();
                exporting.permissions.query({permission: permissionData.permission}, function(err, res){
                    if(err){
                        importReport.permissions.failed ++;
                        if(callback){
                            callback();
                        }
                        return;
                    }
                    if(res.length > 0){
                        exporting.permissions.update(res[0]._id, permissionData, function(err){
                            if (err) {
                                importReport.permissions.failed ++;
                            } else {
                                importReport.permissions.successful ++;
                            }
                            if(callback){
                                callback();
                            }
                        });
                    } else {
                        exporting.permissions.create(permissionData, function (err) {
                            if (err) {
                                importReport.permissions.failed ++;
                            } else {
                                importReport.permissions.successful ++;
                            }
                            if(callback){
                                callback();
                            }
                        });
                    }
                });
            };

            data.Personas = data.Personas || [];
            data.Roles = data.Roles || [];
            data.Permissions = data.Permissions || [];
            async.parallel(data.Personas.map(function(persona){return function(callback){importPersona(persona, callback);}}).concat(
                            data.Roles.map(function(role){
                                return function(callback){importRole(role, callback);
                                }})).concat(
                            data.Permissions.map(function(permission){
                                return function(callback){importPermission(permission, callback);
                                }})),
                            function(){
                                if(callback){
                                    callback(importReport);
                                }
            });

        },
        /**
            @method export
            @param {Method} callback the callback to execute upon completion of the export
        */
        export: function (callback) {
            var exp = { };
            exporting.persona.query({}, function (err1, personaResult) {
                exp.Personas = personaResult;
                exporting.permissions.query({}, function (err2, permissionsResult) {
                    exp.Permissions = permissionsResult;
                    exporting.roles.query({}, function (err3, rolesResult) {
                        exp.Roles = rolesResult;
                        callback.apply(this, [exp]);
                    });
                });
            });
        }
    };

    // For backward compatability ONLY
    // TODO: Drop this
    for (var method in exporting.persona) {
        if (exporting.persona.hasOwnProperty(method)) {
            (function (exporting, method) {
                exporting[method] = function () {
                    Ozone.logger.warning("Ozone.Service('Personas')." + method + "() is deprecated; use Ozone.Service('Personas').persona." + method + "() instead");
                    exporting.persona[method].apply(this, Array.prototype.slice.call(arguments, 0));
                }
            }(exporting, method));
        }
    }
    module.exports = exporting;
}());
