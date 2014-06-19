/**
	Implements the in-memory session store provider; simply sets up the application engine (express.js) to use express.js's default session store.

	@module Ozone.Sessions.Memory
	@class Ozone.Sessions.Memory
	@submodule Server-Side
*/
module.exports = (function (callback, Ozone) {
	var express = require("express");

	// Setup the session
	Ozone.Service("ApplicationEngine").use(express.cookieParser());
	var sessionOpts = {
		secret: Ozone.config().getServerProperty("session.secret"),
		key: Ozone.config().getServerProperty("session.key")
	};

	Ozone.logger.debug("Ozone Container -> main.js -> session option secret: " + sessionOpts.secret);
	Ozone.logger.debug("Ozone Container -> main.js -> session option key: " + sessionOpts.key);
	Ozone.logger.debug("Ozone Container -> main.js -> session option store: memory");

	Ozone.Service("ApplicationEngine").use(require("express").session(sessionOpts));
});
