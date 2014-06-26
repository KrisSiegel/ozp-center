/**
	@module Ozone.Services
	@submodule Client-Side
*/
Ozone.Service("Personas", (function () {

	var personaAccessor = function (obj) {
        if (obj == null) {
            Ozone.logger.error("null object passed to personaAccessor; returning null");
            return null;
        };
		var persona = obj;

		/**
			@class Ozone.Services.Personas.Persona
		*/
		return {
			/**
				Gets the current persona object

				@method get
			*/
			get: function () {
				return persona;
			},
			/**
				@method getId
			*/
			getId: function () {
				return persona._id;
			},
			/**
				@method getViewedHelpPage
			*/
            getViewedHelpPage: function() {
                if(Ozone.utils.safe(persona, "meta.viewedHelpPage")){
                    return persona.meta.viewedHelpPage;
                }
                return false;
            },
			/**
				@method setViewedHelpPage
				@param {Boolean} boolViewedHelpPage a boolean value representing whether the help overlay has been viewed or not
			*/
            setViewedHelpPage: function(boolViewedHelpPage){
                if (Ozone.utils.isUndefinedOrNull(persona.meta)) {
                    persona.meta = { };
                }
                persona.meta.viewedHelpPage = !!boolViewedHelpPage;
                Ozone.Service("Personas").persona.update(persona, function(response) { });
            },
			/**
				@method getPermissions
			*/
			getPermissions: function () {
				return Ozone.utils.safe(persona, "meta.permissions");
			},
			/**
				@method addPermission
				@param {String} perm the permission to add
			*/
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

			/**
				@method removePermission
				@param {String} perm the permission to remove
			*/
			removePermission: function (perm) {
				if (Ozone.utils.isUndefinedOrNull(Ozone.utils.safe(persona, "meta.permissions"))) {
					throw "No permissions to remove";
				} else {
					persona.meta.permissions.splice(persona.meta.permissions.indexOf(perm), 1);
					Ozone.Service("Personas").persona.update(persona, function(response) {

					});
				}
			},
			/**
				@method removeAllPermissions
				@param {Boolean} delaySave (optional) delays saving until another action occurs if true
			*/
			removeAllPermissions: function (delaySave) {
				persona.meta.permissions = [];
				if (!delaySave) {
					Ozone.Service("Personas").persona.update(persona, function(response) {

					});
				}
			},
			/**
				@method hasPermission
				@param {String} perm the permission to check for
			*/
			hasPermission: function (perm) {
				return ((Ozone.utils.safe(persona, "meta.permissions") || []).indexOf(perm) !== -1);
			},
			/**
				@method getRoles
			*/
			getRoles: function () {
				return Ozone.utils.safe(persona, "meta.role");
			},
			/**
				@method getUsername
			*/
			getUsername: function () {
				return persona.username;
			},
			/**
				@method getFavoriteApps
			*/
			getFavoriteApps: function () {
				return (persona.meta || { }).favoriteApps;
			},
			/**
				@method addFavoriteApp
				@param {Object} favoriteApp the application to add to favorites
				@param {Method} callback the callback to execute upon completion
			*/
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
			/**
				@method removeFavoriteApp
				@param {Object} favoriteApp the application to remove from favorites
				@param {Method} callback the callback to execute upon completion
			*/
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
			/**
				@method getLaunchedApps
			*/
			getLaunchedApps: function () {
				return (persona.meta || { }).launchedApps;
			},
			/**
				@method getLaunchedAppsArray
			*/
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
			/**
				@method addLaunchedApp
				@param {Object} launchedApp the application launched
				@param {Method} callback the callback to execute upon execution
			*/
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
			/**
				@method setProfileImage
				@param {String} fileId the id of the file associated with the profile's image
				@param {Method} callback the callback to execute upon completion
			*/
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
			/**
				@method getCollections
				@param {String} id the id of the collection to get
			*/
			getCollections: function (id) {
				var collections = (persona.meta || { }).collections || [ ];
				if (Ozone.utils.isUndefinedOrNull(id)) {
					return collections;
				}

				return Ozone.utils.getFromArrayWithField(collections, "id", id);
			},
			/**
				@method setColletion
				@param {String} id the id of the collection
				@param {Object} collection the collection object itself
				@param {Method} callback the callback to execute upon completion
			*/
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
			/**
				@method removeCollection
				@param {String} id the id of the collection to remove
				@param {Method} callback the callback to execute upon completion
			*/
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

	/**
		@class Ozone.Services.Personas
	*/
	var api = {
		/**
			Gets the service path

			@method getServicePath
		*/
		getServicePath: function () {
			return Ozone.utils.murl("apiBaseUrl", "/personas/", "servicesHost");
		},
		/**
			@method export
			@param {Method} callback the callback to execute upon completion
		*/
		export: function (callback) {
			Ozone.Service("Exporter").exportService("Personas", callback);
		},
		persona: {
			/**
				@method persona.envelop
				@param {Object} obj the object to envelop within the persona wrapper
			*/
			envelop: function (obj) {
				return personaAccessor(obj);
			},
			/**
				Gets the currently logged in user and returns a persona object.

				@method persona.getCurrent
				@param {Method} callback executes callback upon completion
			*/
			getCurrent: function (callback, context) {
				if (!Ozone.utils.isFunction(callback)) {
	            	throw "No callback defined";
	            }

				var url = api.getServicePath() + "persona/current/";
				Ozone.ajax({
					method: "GET",
					url: url,
					withCredentials: true,
					success: function (status, response) {
						Ozone.logger.debug("persona.getCurrent-->success");
						callback.apply((context || this), [personaAccessor(response)]);
					},
					error: function (status, response) {
						Ozone.logger.debug("persona.getCurrent-->error, status: " + status);
						callback.apply((context || this), [personaAccessor(response)]);
					},
					context: this
				});
			},
			/**
				Updates a persona

				@method persona.update
				@param {Object} persona the persona object to update
				@param {Method} callback the callback to execute upon completion
			*/
			update: function (persona, callback, context) {
				if (!Ozone.utils.isFunction(callback)) {
	            	throw "No callback defined";
	            }
				if (!Ozone.utils.isObject(persona)) {
	            	throw "No persona defined";
	            }

				var url = api.getServicePath() + "persona/" + persona._id;
				Ozone.ajax({
					method: "POST",
					url: url,
					withCredentials: true,
					success: function (status, response) {
						Ozone.logger.debug("persona.update-->success");
						callback.apply((context || this), [personaAccessor(response)]);
					},
					error: function (status, response) {
						Ozone.logger.debug("persona.update-->error, status: " + status);
						callback.apply((context || this), [personaAccessor(response)]);
					},
					context: this,
					data: persona
				});
			},
			/**
				@method persona.getPersonaById
				@param {String} userId the user id to fetch
				@param {Method} callback the callback to execute upon completion
			*/
			getPersonaById: function (userId, callback, context) {
				if (!Ozone.utils.isFunction(callback)) {
	            	throw "No callback defined";
	            }
				if (Ozone.utils.isUndefinedOrNull(userId)) {
	            	throw "No userId defined";
	            }

				var url = api.getServicePath() + "persona/" + userId;
				Ozone.ajax({
					method: "GET",
					url: url,
					withCredentials: true,
					success: function (status, response) {
						Ozone.logger.debug("persona.getPersonaById-->success");
						callback.apply((context || this), [personaAccessor(response[0])]);
					},
					error: function (status, response) {
						Ozone.logger.debug("persona.getPersonaById-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: this
				});
			},
			/**
				@method persona.query
				@param {Object} selector the selector to use when querying for persona objects
				@param {Method} callback the callback to be executed upon completion
			*/
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

				Ozone.ajax({
					method: "GET",
					url: url,
					query: queryObj,
					withCredentials: true,
					success: function (status, response) {
						Ozone.logger.debug("persona.query-->success");
						callback.apply((context || this), [response]);
					},
					error: function (status, response) {
						Ozone.logger.debug("persona.query-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: this
				});
			},
			/**
				@method persona.create
				@param {Object} data the persona object to create
				@param {Method} callback the callback to execute upon creation
			*/
			create: function (data, callback, context) {
				if (!Ozone.utils.isFunction(callback)) {
	            	throw "No callback defined";
	            }
				if (!Ozone.utils.isObject(data)) {
	            	throw "No data defined";
	            }

				var url = api.getServicePath() + "persona/";
				Ozone.ajax({
					method: "POST",
					url: url,
					withCredentials: true,
					success: function (status, response) {
						Ozone.logger.debug("persona.create-->success");
						callback.apply((context || this), [personaAccessor(response)]);
					},
					error: function (status, response) {
						Ozone.logger.debug("persona.create-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: this,
					data: data
				});
			},
			/**
				@method persona.delete
				@param {String} userId the user id to delete
				@param {Method} callback the callback to execute upon deletion
			*/
			del: function (userId, callback, context) {
				if (!Ozone.utils.isFunction(callback)) {
	            	throw "No callback defined";
	            }
				if (Ozone.utils.isUndefinedOrNull(userId)) {
	            	throw "No userId defined";
	            }

				var url = api.getServicePath() + "persona/" + userId;
				Ozone.ajax({
					method: "DELETE",
					url: url,
					withCredentials: true,
					success: function (status, response) {
						Ozone.logger.debug("persona.delete-->success");
						callback.apply((context || this), [response]);
					},
					error: function (status, response) {
						Ozone.logger.debug("persona.delete-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: this
				});
			}
		},
		permissions: {
			/**
				@method permissions.get
				@param {String} permissionId the permission id to fetch
				@param {Method} callback the callback to execute upon completion
			*/
			get: function (permissionId, callback) {
				if (!Ozone.utils.isFunction(callback)) {
	            	throw "No callback defined";
	            }
				if (Ozone.utils.isUndefinedOrNull(permissionId)) {
	            	throw "No permissionId defined";
	            }

				var url = api.getServicePath() + "permission/" + permissionId;
				Ozone.ajax({
					method: "GET",
					url: url,
					withCredentials: true,
					success: function (status, response) {
						Ozone.logger.debug("persona.getPermissionById-->success");
						callback.apply((context || this), [response]);
					},
					error: function (status, response) {
						Ozone.logger.debug("persona.getPermissionById-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: this
				});
			},
			/**
				@method permissions.query
				@param {Object} selector the selector to use when querying permissions
				@param {Method} callback the callback to execute upon completion
			*/
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

				Ozone.ajax({
					method: "GET",
					url: url,
					query: queryObj,
					withCredentials: true,
					success: function (status, response) {
						Ozone.logger.debug("permission.query-->success");
						callback.apply((context || this), [response]);
					},
					error: function (status, response) {
						Ozone.logger.debug("permission.query-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: this
				});
			}
		},
		roles: {
			/**
				@method roles.query
				@param {Object} selector the selector object to use when querying roles
				@param {Method} callback the callback to execute upon completion
			*/
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

				Ozone.ajax({
					method: "GET",
					url: url,
					query: queryObj,
					withCredentials: true,
					success: function (status, response) {
						Ozone.logger.debug("role.query-->success");
						callback.apply((context || this), [response]);
					},
					error: function (status, response) {
						Ozone.logger.debug("role.query-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: this
				});
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
