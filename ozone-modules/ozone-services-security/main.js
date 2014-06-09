(function () {
	"use strict";

	function setup(callback, Ozone) {
		var logger = Ozone.logger;

		if (!Ozone.utils.isUndefinedOrNull(Ozone.config().getServerProperty("security.module"))) {
			logger.debug("Security-->main-->Ozone Security Module: " + Ozone.config().getServerProperty("security.module"));
			logger.debug("Security-->main-->requiring: " + Ozone.config().getServerProperty("security.module"));
			require(Ozone.config().getServerProperty("security.module"))(Ozone);
		}
		else {
			logger.debug("Security-->main-->Ozone/Configuration is not defined.");
		}

		Ozone.routing.get("/security/logout", function (req, res, next) {
			if (Ozone.utils.safe(req, "session.user") !== undefined) {
				req.session.destroy();
			}
			res.send("Session terminated");
		});
	};

	module.exports = setup;
}());
