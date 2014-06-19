/**
	The entry point to the PersistenceMongo service which simply provides the implementation for the Persistence Interface.

	@module Ozone.Services.PersistenceMongo
	@class Ozone.Services.PersistenceMongo
	@submodule Server-Side
*/
module.exports = (function (callback, Ozone) {
	"use strict";
	Ozone.Service().on("ready", "PersistenceCommon", function () {
		require("./mongo")(Ozone);
	});
});
