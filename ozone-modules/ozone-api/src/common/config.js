/**

	@module Ozone
	@class Ozone.config
*/
Ozone.extend(function () {
	var configuration = { };

	var accessor = (function () {
		var common = {
			/**
				Gets the full configuration in JavaScript Object form.

				@method common.getConfig
			*/
			getConfig: function () {
				return configuration;
			},
			/**
				Gets the common configuration section only.

				@method common.getCommonConfig
			*/
			getCommonConfig: function () {
				return Ozone.utils.safe(configuration, "common");
			},
			/**
				Gets a specific properly from a specific configuration object, safely.

				@method common.getProperty
				@param {Object} conf the configuration object
				@param {String} prop the path of the property to access (e.g. "my.test.config")
			*/
			getProperty: function (conf, prop) {
				return Ozone.utils.safe(conf, prop);
			},
			/**
				Gets a common property safely.

				@method common.getCommonProperty
				@param {String} prop the path of the common property to access
			*/
			getCommonProperty: function (prop) {
				return common.getProperty(configuration.common, prop);
			}
		};
		var server = {
			/**
				Gets the entire server configuration in object form.

				@method server.getServerConfig
			*/
			getServerConfig: function () {
				return Ozone.utils.safe(configuration, "server");
			},
			/**
				Gets a server property safely

				@method server.getServerProperty
				@param {String} prop the path of the server property to access
			*/
			getServerProperty: function (prop) {
				return common.getProperty(configuration.server, prop);
			}
		};
		var client = {
			/**
				Gets the entire client configuration in object form.

				@method client.getClientConfig
			*/
			getClientConfig: function () {
				return Ozone.utils.safe(configuration, "client");
			},
			/**
				Gets a client property safely

				@method client.getClientProperty
				@param {String} prop the path of the client property to access
			*/
			getClientProperty: function (prop) {
				return common.getProperty(configuration.client, prop);
			}
		};
		return Ozone.extend(client, Ozone.extend(common, server));
	}());

	return {
		config: function (conf, environment) {
			if (!Ozone.utils.isUndefinedOrNull(conf)) {
				configuration = (Ozone.utils.isUndefinedOrNull(environment) ? conf : Ozone.extend(environment, conf));
			}
			return accessor;
		}
	};
}());
