(function () {

    var api = Ozone.Service("Tags");

    var genericService = {
		getServicePath: function () {
			return Ozone.utils.murl("apiBaseUrl", this.controller, true);
		},
        export: function (callback) {
            Ozone.Service("Exporter").exportService("TagTopic", callback);
        },
		get: function (id, callback, context) {
			if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) { // get all
				context = callback;
				callback = id;
			}

			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }

			var url = api.getServicePath() + this.endComponent;
			if (id !== undefined && !Ozone.utils.isFunction(id)) {
				url = url + id;
			}

			Ozone.ajax({
				method: "GET",
				url: url,
				success: function (status, response) {
					Ozone.logger.debug(this.serviceName + ".get-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug(this.serviceName + ".get-->error, status: " + status);
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

			var queryObj = null;
            if (typeof this.buildQueryObject === 'function') {
                queryObj = this.buildQueryObject(selector);
            } else {
                queryObj = selector;
            }

			Ozone.logger.debug("in tag query, queryObj: " + JSON.stringify(queryObj, null, 3));

			var url = this.getServicePath() + this.endComponent;
			Ozone.ajax({
				method: "GET",
				url: url,
				query: queryObj,
				success: function (status, response) {
					Ozone.logger.debug(this.serviceName + ".query-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug(this.serviceName + ".query-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		create: function (newItem, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(newItem)) {
            	throw "No newItem defined";
            }

			var url = api.getServicePath() + this.endComponent;
			Ozone.ajax({
				method: "POST",
				url: url,
				data: newItem,
				success: function (status, response) {
					Ozone.logger.debug(this.serviceName + ".create-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug(this.serviceName + ".create-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		update: function (updateItem, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(updateItem)) {
            	throw "No updateItem defined";
            }

			var id = (updateItem.id || updateItem._id);
			if (id === undefined) {
				throw "updateItem has no id";
			}

            var ec = this.endComponent
            if(ec.length > 0 && ec[ec.length - 1] != '/' )
                ec += '/';

            var url = api.getServicePath() + ec + id;

            Ozone.ajax({
				method: "PUT",
				url: url,
				data: updateItem,
				success: function (status, response) {
					Ozone.logger.debug(this.serviceName + ".update-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug(this.serviceName + ".update-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		del: function (deleteItem, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(deleteItem)) {
            	throw "No deleteItem defined";
            }

			var id = (deleteItem.id || deleteItem._id);
			if (id === undefined) {
				throw "deleteItem has no id";
			}
			var url = api.getServicePath() + this.endComponent + '/' + id;
			Ozone.ajax({
				method: "DELETE",
				url: url,
				success: function (status, response) {
					Ozone.logger.debug(this.serviceName + ".delete-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug(this.serviceName + ".delete-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		}
	};

    // Support of IE8 and it's terrible understanding of ECMAScript
    genericService["delete"] = genericService.del;

    function serviceClass(serviceName, controller, endComponent) {
        this.controller = controller;
        this.serviceName = serviceName;
        this.endComponent = endComponent;
        this.buildQueryObject = function (selector) {
            var fields = [
                "id",
                "level",
                "topic",
                "uri",
                "tag",
                "createdUserId",
                "visibility"
            ];
            var queryObj = {};
            for (var i = 0, len = fields.length; i < len; i++) {
                var field = fields[i];
			    if (selector[field]) {
				    queryObj[field] = selector[field];
                }
			}
            return queryObj;
        };
    };

    serviceClass.prototype = genericService;
    api.topic = new serviceClass("Tags.topic", "tags/", "tagTopic");

}());
