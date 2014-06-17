module.exports = (function (callback, Ozone) {
	"use strict";

	Ozone.Service("PersistenceCommon", require("./persistence-interface"));

	Ozone.Service().on("ready", "Persistence", function () {
		require('./routes')(Ozone);
	});
});
