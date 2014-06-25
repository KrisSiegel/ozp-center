/**
	Ozone is the object that gains access to the client and server side of the API. main.js is included first before all other Ozone API files.

	@module Ozone
	@class Ozone
*/
var Ozone = Ozone || (function () {
	return {
		/**
			Extend provides a mixin capability with an optional target allowing it to apply

			@method extend
			@param {Object} obj the source object to mix into another object.
			@param {Object} target (optional) the target object to mix the source into. If elided the Ozone object becomes the target.
		*/
		extend: function (obj, target) {
			target = (target || Ozone);
			if (Object.prototype.toString.call(obj) === "[object Object]") {
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
							if (target[key] === undefined) {
								target[key] = { };
							}
							target[key] = Ozone.extend(obj[key], target[key]);
						} else if (Object.prototype.toString.call(obj[key]) === "[object Array]") {
							target[key] = (target[key] || []).concat(obj[key]);
						} else {
							target[key] = obj[key];
						}
					}
				}
			}
			return target;
		}
	};
}());
