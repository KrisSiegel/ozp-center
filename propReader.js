
module.exports = (function (basePath) {
	var fs = require("fs");
	var p = require("path");
	
	return {
		prop: function (file) {
			file = (file.indexOf(".properties") === -1) ? (file + ".properties") : file;
			var path = (fs.existsSync(file)) ? file : undefined;
			path = path || (fs.existsSync(p.join(basePath, file)) ? p.join(basePath, file) : undefined);
			if (path !== undefined) {
				var f = fs.readFileSync(path, { encoding: "utf8" });
				var props = { };
				if (f !== undefined) {
					var properties = f.split("\n");
					for (var i = 0; i < properties.length; ++i) {
						var entry = properties[i].split("=");
						props[entry[0]] = entry[1];
					}
				}
				return props;
			}
			return undefined;
		}
	};
});
