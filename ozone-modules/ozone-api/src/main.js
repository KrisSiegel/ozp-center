var Ozone = Ozone || (function () {
	return {
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
