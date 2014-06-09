(function () {
	"use strict";

	function setup(callback, Ozone) {
		var logger = Ozone.logger;
		
		if (!Ozone.utils.isUndefinedOrNull(Ozone.config().getServerProperty("persistence.module"))) {
			require(Ozone.config().getServerProperty("persistence.module"))(Ozone, function(persistence) {
				Ozone.Service("Persistence", persistence);
				
				// also set up REST api
				require('./routes')(Ozone);
				
				if (callback) callback(Ozone);
			});
			
		} else {
			throw "[ERROR] Unable to include Persistence module properly."
		}
	};
	
	module.exports = setup;
}());
