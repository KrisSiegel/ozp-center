/**
	The entry point to the PersistenceMock service which simply provides the implementation for the Persistence Interface.

	@module Ozone.Services.PersistenceMock
	@class Ozone.Services.PersistenceMock
	@submodule Server-Side
*/
module.exports = (function (callback, Ozone) {
	"use strict";
	Ozone.Service().on("ready", "PersistenceCommon", function () {
		require("./mock")(Ozone);
	});
});
