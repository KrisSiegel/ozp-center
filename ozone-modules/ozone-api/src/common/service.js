/**
	@module Ozone
	@class Ozone
*/
Ozone.extend(function () {
	var services = { };
	var queued = { };

	var catchUpQueued = function (service) {
		if (!Ozone.utils.isUndefinedOrNull(services[service])) {
			if (queued[service] !== undefined && queued[service].length > 0) {
				while (queued[service].length > 0) {
					var q = queued[service].shift();
					q.apply(this, []);
				}
			}
		}
	};

	/**
		These are handlers that should be matched up with the event specified in Ozone.Service().on().
		At the moment only ready is functional. This could be expanded though it may be less awkward to
		move it to, say, Ozone.on and provide a more universal eventing mechanism.
	*/
	var onHandler = {
		ready: function (service, callback) {
			if (queued[service] === undefined) {
				queued[service] = [];
			}
			queued[service].push(callback);
			catchUpQueued(service);
		}
	};

	return {
		/**
			The Ozone.Service() method is the main point of access for all Ozone APIs on the client or server.
			A unique trait of this method is passing no parameters returns an object in which allows for eventing
			on ready or a view into the registered services.

			@method Ozone.Service
			@param {String} name (optional) the name of the service to get or set
			@param {Object} service (optional) when specified it sets the specified object as the service
		*/
		Service: function (name, service) {
			// Only a name was specified; return the service
			if (!Ozone.utils.isUndefinedOrNull(name) && Ozone.utils.isUndefinedOrNull(service)) {
				return services[name];
			}

			// A name and service was specified; register the service
			if (!Ozone.utils.isUndefinedOrNull(name) && !Ozone.utils.isUndefinedOrNull(service)) {
				services[name] = service;
				catchUpQueued(name);
				return services[name];
			}

			// No arguments were specified; return the service object
			return {
				/**
					A raw access to all services. It's not recommended to use this beyond perhaps counting.

					@property Ozone.Service().registeredServices
					@type Object
					@default {}
				*/
				registeredServices: services,
				/**
					A way of exposing events. Currently only a ready event is supported.

					@method Ozone.Service().on
					@param {String} event the event to register (only one working is currently "ready")
					@param {String} service the service to wait for when combined with "ready" as the event
					@param {Method} callback the callback to execute when the requested service is registered
				*/
				on: function (event) {
					var args = Array.prototype.slice.call(arguments);
 					args.shift();
 					if (onHandler[event] !== undefined) {
 						onHandler[event].apply(this, args);
 					}
				}
			};
		},
		ServiceLookup: function() {
		    var serviceLookupObj = {};
		    for (var serviceName in services) {
		        var serviceObj = services[serviceName] || {};
		        if (Ozone.utils.isFunction(serviceObj.getServicePath)) {
		            serviceLookupObj[serviceName] = serviceObj.getServicePath();
		        }
		    }
		    return serviceLookupObj;
		}
	};
}());
