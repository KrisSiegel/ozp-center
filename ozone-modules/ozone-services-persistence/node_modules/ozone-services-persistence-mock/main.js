(function () {
	"use strict";

	module.exports = function (Ozone, callback) {
		var logger = Ozone.logger;
		
		require('./mock')(Ozone, function(mock) {
			callback(mock);
		});
	};
}());