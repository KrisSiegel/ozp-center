Ozone.Service("Apps", (function () {
	var service = {
		getServicePath: function () {
			return Ozone.utils.murl("apiBaseUrl", "/apps/", true);
		},
		getRedirectUrl: function (shortname) {
			return Ozone.utils.murl("hudUrl", ["/#App/", shortname, "/"], false);
		},
		redirectIntoHudWithoutLogging: function (shortname) {
			location.href = this.getRedirectUrl(shortname);
		},
		launchAppByShortname: function (shortname, postUpdateCallback) {
			var win = window.open(this.getRedirectUrl(shortname));
			// AMLUI-182: removed onload event call that wasn't getting invoked in Chrome or FF.
			Ozone.logger.debug("application.js-->launchAppByShortname-->callback after window.open");
			Ozone.Service("Apps").updateLaunchedCount(shortname, postUpdateCallback);
		},
		export: function (callback) {
			Ozone.Service("Exporter").exportService("Apps", callback);
		},
		get: function (id, callback, context) {
			if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) { // get all
				context = callback;
				callback = id;
			}

			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }

			var url = this.getServicePath() + "app/";
			if (id !== undefined && !Ozone.utils.isFunction(id)) {
				url = url + id;
			}

			Ozone.ajax({
				method: "GET",
				url: url,
				success: function (status, response) {
					Ozone.logger.debug("Apps.get-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Apps.get-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
                retries: 2,
				context: (context || this)
			});
		},
		query: function (selector, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (!Ozone.utils.isObject(selector)) {
            	throw "No selector defined";
            }

			// currently, available fields for query are: app name (in app collection), tag (in tag collection).
			var queryObj = {};
			if (selector.name) {
				queryObj.q = selector.name;
			}
			if (selector.shortname) {
				queryObj.shortname = selector.shortname;
			}
			if (selector.autocomplete) {
				queryObj.autocomplete = 'true';
			}
			if (selector.tags) { // is array
				queryObj.tag = selector.tags.join();
			}
			if (selector.workflowState) {
				queryObj.workflowState = selector.workflowState;
			}
			Ozone.logger.debug("in app query, queryObj: " + JSON.stringify(queryObj, null, 3));

			var url = this.getServicePath() + "app/";
			Ozone.ajax({
				method: "GET",
				url: url,
				query: queryObj,
				success: function (status, response) {
					Ozone.logger.debug("Apps.query-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Apps.query-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		create: function (app, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(app)) {
            	throw "No app defined";
            }

			var url = this.getServicePath() + "app/";
			Ozone.ajax({
				method: "POST",
				url: url,
				data: app,
				success: function (status, response) {
					Ozone.logger.debug("Apps.create-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Apps.create-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		update: function (app, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(app)) {
            	throw "No app defined";
            }

			var id = (app.id || app._id);
			if (id === undefined) {
				throw "app has no id";
			}
			var url = this.getServicePath() + "app/" + id;
			Ozone.ajax({
				method: "PUT",
				url: url,
				data: app,
				success: function (status, response) {
					Ozone.logger.debug("Apps.update-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Apps.update-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		del: function (app, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(app)) {
            	throw "No app defined";
            }

			var id = (app.id || app._id);
			if (id === undefined) {
				throw "app has no id";
			}
			var url = this.getServicePath() + "app/" + id;
			Ozone.ajax({
				method: "DELETE",
				url: url,
				success: function (status, response) {
					Ozone.logger.debug("Apps.delete-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Apps.delete-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		updateLaunchedCount: function(shortname, postUpdateCallback) {
			var selector = {
				shortname: shortname
			};
			Ozone.logger.debug('Apps.updateLaunchedCount');
			this.query(selector, function(apps) {
				Ozone.logger.debug('Apps.updateLaunchedCount-->apps:' + JSON.stringify(apps, null, 3));
				if (!Ozone.utils.isUndefinedOrNull(apps) && apps.length === 1) {
					var app = apps[0];
					if (app.launchedCount === undefined) {
						app.launchedCount = 0;
					}
					app.launchedCount++;
					Ozone.logger.debug('Apps.updateLaunchedCount-->incremented launchedCount: ' + app.launchedCount);

					Ozone.Service("Apps").update(app, function (updatedCount) {
	                    Ozone.logger.debug("Apps.updateLaunchedCount-->updatedCount: " + JSON.stringify(updatedCount));

	                    Ozone.Service("Personas").getCurrent(function (persona) {
	                    	Ozone.logger.debug("Apps.updateLaunchedCount-->persona: " + persona.getUsername());

	                        if (!Ozone.utils.isUndefinedOrNull(persona.getId())) {
	                        	// update the persona's launched apps
	                        	var launchedApp = {
	                                appShortName: shortname,
	                                dateTime: new Date()
	                            };
	                            persona.addLaunchedApp(launchedApp, function(launchedApps) {
	                            	Ozone.logger.debug("Apps.updateLaunchedCount-->updated launchedApps: " + JSON.stringify(launchedApps, null, 3));
	                            });
	                        } else {
	                        	Ozone.logger.debug("Apps.updateLaunchedCount-->there is no current persona.");
	                        }
	                    });
	                    // adding post-update callback for refreshing UI with new launch count value
	                    if (Ozone.utils.isFunction(postUpdateCallback)) {
	                        postUpdateCallback(app);
	                    }
	                });
				} else {
					Ozone.logger.debug("Apps.updateLaunchedCount-->no app found with shortname: " + shortname);
				}
			});
		},
		imp: function (file, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(file)) {
            	throw "No file defined";
            }

			var formData = new FormData();
        	formData.append(file.name, file);

			var url = this.getServicePath() + "import";
			Ozone.ajax({
				method: "POST",
				url: url,
				data: formData,
				success: function (status, response) {
					Ozone.logger.debug("Apps.import-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Apps.import-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
	};

	// Support of IE8 and it's terrible understanding of ECMAScript
	service["delete"] = service.del;
	service["import"] = service.imp;

	return service;
}()));
