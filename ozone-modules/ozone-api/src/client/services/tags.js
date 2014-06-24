Ozone.Service("Tags", (function () {
	var api = {
        getServicePath: function () {
			return Ozone.utils.murl("apiBaseUrl", "/tags/", 'servicesHost');
	    },
		export: function (callback) {
			throw "Method not implemented";
		},
		tag: {
			get: function (id, callback, context) {
				if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) { // get all
					context = callback;
					callback = id;
				}

				if (!Ozone.utils.isFunction(callback)) {
	            	throw "No callback defined";
	            }

				var url = api.getServicePath() + "tag/";
				if (id !== undefined && !Ozone.utils.isFunction(id)) {
					url = url + id;
				}

				Ozone.ajax({
					method: "GET",
					url: url,
					success: function (status, response) {
						Ozone.logger.debug("Tags.get-->success");
						callback.apply((context || this), [response]);
					},
					error: function (status, response) {
						Ozone.logger.debug("Tags.get-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
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

				var queryObj = {};
				if (selector.id) {
					queryObj.id = selector.id;
				}
				if (selector.level) {
					queryObj.level = selector.level;
				}
				if (selector.topic) {
					queryObj.topic = selector.topic;
				}
				if (selector.uri) {
					queryObj.uri = selector.uri;
				}
				if (selector.tag) {
					queryObj.tag = selector.tag;
				}
				if (selector.createdUserId) {
					queryObj.createdUserId = selector.createdUserId;
				}
				if (selector.visibility) {
					queryObj.visibility = selector.visibility;
				}

				Ozone.logger.debug("in tag query, queryObj: " + JSON.stringify(queryObj, null, 3));

				var url = api.getServicePath() + "tag/";
				Ozone.ajax({
					method: "GET",
					url: url,
					query: queryObj,
					success: function (status, response) {
						Ozone.logger.debug("Tags.query-->success");
						callback.apply((context || this), [response]);
					},
					error: function (status, response) {
						Ozone.logger.debug("Tags.query-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: (context || this)
				});
			},
			create: function (tag, callback, context) {
				if (!Ozone.utils.isFunction(callback)) {
	            	throw "No callback defined";
	            }
				if (Ozone.utils.isUndefinedOrNull(tag)) {
	            	throw "No tag defined";
	            }

				var url = api.getServicePath() + "tag/";
				Ozone.ajax({
					method: "POST",
					url: url,
					data: tag,
					success: function (status, response) {
						Ozone.logger.debug("Tags.create-->success " + JSON.stringify(response));
						callback.apply((context || this), [response]);
					},
					error: function (status, response) {
						Ozone.logger.debug("Tags.create-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: (context || this)
				});
			},
			update: function (tag, callback, context) {
				if (!Ozone.utils.isFunction(callback)) {
	            	throw "No callback defined";
	            }
				if (Ozone.utils.isUndefinedOrNull(tag)) {
	            	throw "No app defined";
	            }

				var id = (tag.id || tag._id);
				if (id === undefined) {
					throw "app has no id";
				}
				var url = api.getServicePath() + "tag/" + id;
				Ozone.ajax({
					method: "PUT",
					url: url,
					data: tag,
					success: function (status, response) {
						Ozone.logger.debug("Tags.update-->success");
						callback.apply((context || this), [response]);
					},
					error: function (status, response) {
						Ozone.logger.debug("Tags.update-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: (context || this)
				});
			},
			del: function (tag, callback, context) {
				if (!Ozone.utils.isFunction(callback)) {
	            	throw "No callback defined";
	            }
				if (Ozone.utils.isUndefinedOrNull(tag)) {
	            	throw "No tag defined";
	            }

				var id = (tag.id || tag._id);
				if (id === undefined) {
					throw "tag has no id";
				}
				var url = api.getServicePath() + "tag/" + id;
				Ozone.ajax({
					method: "DELETE",
					url: url,
					success: function (status, response) {
						Ozone.logger.debug("Tags.delete-->success");
						callback.apply((context || this), [response]);
					},
					error: function (status, response) {
						Ozone.logger.debug("Tags.delete-->error, status: " + status);
						callback.apply((context || this), [response]);
					},
					context: (context || this)
				});
			}
		}
    };

	// Support of IE8 and it's terrible understanding of ECMAScript
	api["delete"] = api.del;

    // To support old API:
    for (var methodName in api.tag) {
        (function(methodName, method) {
            api[methodName] = function() {
                Ozone.logger.warning('Ozone.Service("Tags").' + methodName + '() is deprecated.  Use Ozone.Service("Tags").tag.' + methodName + '() instead.');
                return method.apply(this, arguments);
            };
        })(methodName, api.tag[methodName]);
    };

    return api;
}()));
