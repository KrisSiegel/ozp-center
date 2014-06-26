/**
    @module Ozone.Services
    @class Ozone.Services.Topics
    @submodule Client-Side
*/
(function () {

    var api = Ozone.Service("Tags");

    var genericService = {
        /**
            Gets the service path

            @method getServicePath
        */
		getServicePath: function () {
			return Ozone.utils.murl("apiBaseUrl", this.controller, 'servicesHost');
		},
        /**
            @method export
            @param {Method} callback the callback to execute upon completion
        */
        export: function (callback) {
            Ozone.Service("Exporter").exportService("TagTopic", callback);
        },
        /**
            @method get
            @param {String} id the id to get
            @param {Method} callback the callback to execute with a result
        */
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
        /**
            @method query
            @param {Object} selector the selector object to query with
            @param {Method} callback the callback to execute with a result
            @param {Object} context (optional) the context to execute the callback within if desired
        */
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
        /**
            @method create
            @param {Object} newItem the topic to create
            @param {Method} callback the callback to execute upon completion
        */
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
        /**
            @method update
            @param {Object} updateItem the topic object to update
            @param {Method} callback the callback to execute upon completion
        */
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
        /**
            @method delete
            @param {Object} deleteItem the topic to delete
            @param {Method} callback the callback to execute upon completion
        */
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
