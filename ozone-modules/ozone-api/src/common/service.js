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
				registeredServices: services,
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
