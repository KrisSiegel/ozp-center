/**
	Provides basic reading capabilities of properties files.

	@module Ozone
	@submodule Server-Side
	@class Ozone

	@method propReader
	@param {String} basePath the base path where .properties files are located.
*/
module.exports = (function (basePath) {
	var fs = require("fs");
	var p = require("path");

	return {
		/**
			Provides an object with a mapping of key value pairs that were contained within the .properties file.

			@method propReader(basePath).prop
			@param {String} file the file name of a properties file within the specified basePath
			@return {Object} an object with key value pairs aligning to the contents within the .properties file
		*/
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
