/**
	Implements the redis session store provider; simply sets up the application engine (express.js) to use redis's session store.

	@module Ozone.Sessions.Redis
	@class Ozone.Sessions.Redis
	@submodule Server-Side
*/
module.exports = (function (callback, Ozone) {
	var express = require("express");
	var RedisStore = require("connect-redis")(express);
	var redis = require("redis");

	// Setup the session
	Ozone.Service("ApplicationEngine").use(express.cookieParser());
	var sessionOpts = {
		secret: Ozone.config().getServerProperty("session.secret"),
		key: Ozone.config().getServerProperty("session.key"),
		cookie: {
			maxAge: Ozone.config().getServerProperty("session.maxAge")
		}
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
