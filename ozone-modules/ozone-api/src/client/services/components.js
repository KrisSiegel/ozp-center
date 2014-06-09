Ozone.Service("Components", (function () {
	var service = {
		getServicePath: function () {
			return Ozone.utils.murl("apiBaseUrl", "/components/", true);
		},
		get: function (id, callback, context) {
			if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) { // get all
				context = callback;
				callback = id;
			}

			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }

			var url = this.getServicePath() + "component/";
			if (id !== undefined && !Ozone.utils.isFunction(id)) {
				url = url + id;
			}

			Ozone.ajax({
				method: "GET",
				url: url,
				success: function (status, response) {
					Ozone.logger.debug("Components.get-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Components.get-->error, status: " + status);
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

			// currently, available fields for query are: component name (in component collection), tag (in tag collection).
			var queryObj = {};
			if (selector.name) {
				queryObj.q = selector.name;
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
			Ozone.logger.debug("in component query, queryObj: " + JSON.stringify(queryObj, null, 3));

			var url = this.getServicePath() + "component/";
			Ozone.ajax({
				method: "GET",
				url: url,
				query: queryObj,
				success: function (status, response) {
					Ozone.logger.debug("Components.query-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Components.query-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		create: function (component, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(component)) {
            	throw "No component defined";
            }

			var url = this.getServicePath() + "component/";
			Ozone.ajax({
				method: "POST",
				url: url,
				data: component,
				success: function (status, response) {
					Ozone.logger.debug("Components.create-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Components.create-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		update: function (component, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(component)) {
            	throw "No component defined";
            }

			var id = (component.id || component._id);
			if (id === undefined) {
				throw "component has no id";
			}
			var url = this.getServicePath() + "component/" + id;
			Ozone.ajax({
				method: "PUT",
				url: url,
				data: component,
				success: function (status, response) {
					Ozone.logger.debug("Components.update-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Components.update-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		del: function (component, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(component)) {
            	throw "No component defined";
            }

			var id = (component.id || component._id);
			if (id === undefined) {
				throw "component has no id";
			}
			var url = this.getServicePath() + "component/" + id;
			Ozone.ajax({
				method: "DELETE",
				url: url,
				success: function (status, response) {
					Ozone.logger.debug("Components.delete-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("Components.delete-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		}
	};

	// Support of IE8 and it's terrible understanding of ECMAScript
	service["delete"] = service.del;

	return service;
}()));
