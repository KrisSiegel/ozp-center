module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	var config = require('./config/default'),
		outfileBase = "hud-components",
		htmlout = outfileBase + ".html",
		jsout = outfileBase + ".js",
		jsmin = outfileBase + ".min.js",
		cssout = outfileBase + ".css",
		uglifyMapping = {};

	uglifyMapping[jsmin] = jsout;

    grunt.initConfig({
		clean: {
			"minify-js": [jsout, jsmin],
			"minify-css": [cssout],
			"minify-html": [htmlout]
		},
		concat: {
			options: {
				process: function(src, filepath) {
					return '/* Original File: ' + filepath + '*/\n' + src;
				}
			},
			"minify-js": {
				src: config.jsFiles,
				dest: jsout
			},
			"minify-css": {
				src: config.cssFiles,
				dest: cssout
			},
			"minify-html": {
 				src: config.htmlFiles,
				dest: htmlout,
				options: {
					banner: '<script type="text/javascript" src="' +
						jsmin + '"></script>\n<link rel="stylesheet" href="' +
						cssout + '">\n',
					process: function (src, filepath) {
						var templateId = filepath.replace(/.*\/([^\/]*).html/,"$1") + "-tpl";
						console.log("templateID is " + templateId);
						var header = '<template class="' + templateId + '">\n';
						return header + src + '\n</template>';
					}
				}
			}
		},
		uglify: {
			"minify-js": {
				options: {
					mangle: true,
					preserveComments: false,
					compress: true
				},
				files: uglifyMapping
			}
		}
	});

	/*
	grunt.registerTask("minify-html", ["clean", "concat"]);
	grunt.registerTask("minify-css", ["clean", "concat"]);
	grunt.registerTask("minify-js", ["clean", "concat", "uglify"]);
	*/
	grunt.registerTask('default', "Do all the concatenation and stuff for the x-tag components used in the HUD", ['concat', 'uglify']);

}
