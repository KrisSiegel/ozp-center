/**
	Routes within the mock security service to handle login and logout.

	@module Ozone.Services.Security
	@class Ozone.Services.Security.Mock
	@submodule Server-Side
*/
var Ozone = null,
	securityConfig = null,
    baseURL = null,
    authService = null;


module.exports = exports = function (Ozone) {
	securityConfig = Ozone.config().getServerProperty("security");
    baseURL = Ozone.config().getServerProperty("security.mock.baseURL");
    authService = Ozone.config().getServerProperty("security.mock.auth_service");

	// set up REST route
    var routing = Ozone.Routing,
    	logger = Ozone.logger;

    logger.debug("Routing(mockSecurity)-->setting up routes");

	/**
		@method /api/security/mockLogin/ POST
	*/
	routing.post(baseURL, function(req, res, next) {
		Ozone.Service("Personas").persona.login({
			username: req.body.username,
			auth_token: req.body.username,
			auth_service: "Mock",
			overriding_role: (req.body.role || Ozone.config().getServerProperty("security.mock.role")),
			ensure: true,
			success: function (persona) {
				res.send(persona);
			}
		}, req, res);
	});

	routing.get("/security/logout", { loggedIn: true }, function (req, res, next) {
		if (Ozone.utils.safe(req, "session.user") !== undefined) {
			req.session.destroy();
		}
		res.send("Session terminated");
	});
};
