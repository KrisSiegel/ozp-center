(function () {
	module.exports = function (grunt) {

		grunt.loadNpmTasks('grunt-contrib-clean');
		grunt.loadNpmTasks('grunt-contrib-concat');
		grunt.loadNpmTasks('grunt-contrib-uglify');
		
		// creating a 'window' object just to avoid undefined error in the configuration file below. We don't need it to build.
		window = {
			location: {
				href: '',
				hash: ''
			}
		};
		
		var config = require('./config/default'),
			paths = config.properties.includes;
		
		grunt.initConfig({
			pkg: grunt.file.readJSON("package.json"),
			clean: ["./applications-mall-ui.js", "./applications-mall-ui.min.js"],
			concat: {
				dist: {
					src: paths,
					dest: "./applications-mall-ui.js",
					options: {
						process: function(src, filepath) {
							return '// Original File: ' + filepath + '\n' + src;
						}
					}
				}
			},
			uglify: {
				minify: {
					options: {
						mangle: false,
						preserveComments: false,
						compress: true
					},
					files: {
						"./applications-mall-ui.min.js": paths
					}
				}
			}
		});
		
		grunt.registerTask("build", ["clean", "concat", "uglify:minify"]);
	};
	
}());