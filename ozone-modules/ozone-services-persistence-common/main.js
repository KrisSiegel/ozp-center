/**
	This is the main entry point for the Persistence Common service accessible by going through the Ozone.Service method as follows:
	Ozone.Service("PersistenceCommon").

	@module Ozone.Services.PersistenceCommon
	@class Ozone.Services.PersistenceCommon
	@submodule Server-Side
*/
module.exports = (function (callback, Ozone) {
	"use strict";

	Ozone.Service("PersistenceCommon", require("./persistence-interface"));

	Ozone.Service().on("ready", "Persistence", function () {
		require('./routes')(Ozone);
	});
});
