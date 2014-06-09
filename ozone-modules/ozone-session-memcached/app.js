
module.exports = (function (callback, Ozone) {
	var express = require("express");
	var MemcachedStore = require('connect-memcached')(express);

	// Setup the session
	Ozone.Service("ApplicationEngine").use(express.cookieParser());
	var sessionOpts = {
		secret: Ozone.config().getServerProperty("session.secret"),
		key: Ozone.config().getServerProperty("session.key")
	};

	Ozone.logger.debug("ozone-session-memcache-->Memcache Host: " + Ozone.config().getServerProperty("session.memcached.hosts"));

	sessionOpts.store =  new MemcachedStore({
		hosts: Ozone.config().getServerProperty("session.memcached.hosts"),
		prefix: Ozone.config().getServerProperty("session.key")
	});

	Ozone.logger.debug("Ozone Container -> main.js -> session option secret: " + sessionOpts.secret);
	Ozone.logger.debug("Ozone Container -> main.js -> session option key: " + sessionOpts.key);
	Ozone.logger.debug("Ozone Container -> main.js -> session option store: memcached");

	Ozone.Service("ApplicationEngine").use(require("express").session(sessionOpts));
});
