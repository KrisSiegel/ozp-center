module.exports = (function (callback, Ozone) {
	"use strict";
	Ozone.Service().on("ready", "PersistenceCommon", function () {
		require("./mock")(Ozone);
	});
});
