
module.exports = (function (callback, Ozone) {
	var express = require("express");
	var RedisStore = require("connect-redis")(express);
	var redis = require("redis");

	// Setup the session
	Ozone.Service("ApplicationEngine").use(express.cookieParser());
	var sessionOpts = {
		secret: Ozone.config().getServerProperty("session.secret"),
		key: Ozone.config().getServerProperty("session.key")
	};

	var redisClient = redis.createClient(Ozone.config().getServerProperty("session.redis.port"), Ozone.config().getServerProperty("session.redis.host"));

	Ozone.logger.debug("ozone-session-redis-->Redis Host: " + Ozone.config().getServerProperty("session.redis.host") + ":" + Ozone.config().getServerProperty("session.redis.port"));

	sessionOpts.store =  new RedisStore({
		client: redisClient,
		prefix: Ozone.config().getServerProperty("session.key")
	});

	Ozone.logger.debug("Ozone Container -> main.js -> session option secret: " + sessionOpts.secret);
	Ozone.logger.debug("Ozone Container -> main.js -> session option key: " + sessionOpts.key);
	Ozone.logger.debug("Ozone Container -> main.js -> session option store: redis");

	Ozone.Service("ApplicationEngine").use(require("express").session(sessionOpts));
});
