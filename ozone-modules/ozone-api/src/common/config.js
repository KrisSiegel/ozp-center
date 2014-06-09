Ozone.extend(function () {
	var configuration = { };

	var accessor = (function () {
		var common = {
			getConfig: function () {
				return configuration;
			},
			getCommonConfig: function () {
				return Ozone.utils.safe(configuration, "common");
			},
			getProperty: function (conf, prop) {
				return Ozone.utils.safe(conf, prop);
			},
			getCommonProperty: function (prop) {
				return common.getProperty(configuration.common, prop);
			}
		};
		var server = {
			getServerConfig: function () {
				return Ozone.utils.safe(configuration, "server");
			},
			getServerProperty: function (prop) {
				return common.getProperty(configuration.server, prop);
			}
		};
		var client = {
			getClientConfig: function () {
				return Ozone.utils.safe(configuration, "client");
			},
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
