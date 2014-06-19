(function () {
    module.exports = function (grunt) {
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-exec');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-markdown-pdf');
        grunt.loadNpmTasks('grunt-contrib-yuidoc');
        grunt.loadTasks('grunts');

        var pack = grunt.file.readJSON("package.json");
        var hudFileLocation = 'apps/ozone-hud/static/',
            amlPublicFolder = 'apps/appsmall/public/'

        grunt.initConfig({
            pkg: pack,
            clean: [
                "ozone-modules/ozone-api/client-api.js",
                "ozone-modules/ozone-api/client-api.min.js",
                "ozone-modules/ozone-api/client-mock-api.js",
                "ozone-modules/ozone-api/client-mock-api.min.js",
                "ozone-modules/ozone-api/server-api.js",
                "README.pdf",
                "docs/code/",
                (hudFileLocation + "*.*")
            ],
            concat: {
                clientApi: {
                    src: pack.clientApiPaths,
                    dest: "ozone-modules/ozone-api/client-api.js",
                },
                clientMockApi: {
                    src: pack.clientMockApiPaths,
                    dest: "ozone-modules/ozone-api/client-mock-api.js",
                },
                serverApi: {
                    src: pack.serverApiPaths,
                    dest: "ozone-modules/ozone-api/server-api.js",
                },
            },
            uglify: {
                minify: {
                    options: {
                        mangle: false,
                        preserveComments: false,
                        compress: true
                    },
                    files: {
                        "ozone-modules/ozone-api/client-api.min.js": pack.clientApiPaths,
                        "ozone-modules/ozone-api/client-mock-api.min.js": pack.clientMockApiPaths,
                        "apps/appsmall/public/js/appsmall-includes.min.js" : pack.appsMallIncludes.map(function (jsFile) {
                            return amlPublicFolder + jsFile;
                        }),
                        "apps/ozone-hud/static/hud-components.min.js": hudFileLocation + "hud-components-micro.js"
                    }
                }
            },
            jshint: {
                files: [
                    "ozone-modules/*.js",
                    "public/applications-mall-ui/js/*.js",
                    "public/ozone-hud/*.js",
                    "main.js",
                    "propReader.js"
                ],
                options: {
                    indent: 4,
                    curly: true
                }
            },
            markdownpdf: {
                options: { },
                files: {
                    src: "./*.md",
                    dest: "./"
                }
            },
            yuidoc: {
                compile: {
                    name: '<%= pkg.name %>',
                    description: '<%= pkg.description %>',
                    version: '<%= pkg.version %>',
                    url: '<%= pkg.homepage %>',
                    options: {
                        paths: ".",
                        outdir: "docs/code/"
                    }
                }
            },
            exec: {
                mongodWithText: "mongod --setParameter textSearchEnabled=true",
                start: "npm start",
                startInTest: "npm test",
                test: "npm test",
                angularTest: "./apps/appsmall/test/test.sh",
                singletar: "./scripts/bundle-single.sh",
                dropDb: ("mongo " + grunt.option("db") + " --eval 'db.dropDatabase()'")
            }
        });


        grunt.registerTask("start-mongod", ["exec:mongodWithText"]);
        grunt.registerTask("mongod", ["exec:mongodWithText"]);
        grunt.registerTask("dropDb", ["exec:dropDb"]);
        grunt.registerTask("build", ["clean", "yuidoc", "concat", "component-concat", "uglify:minify"]);
        grunt.registerTask("bundle", ["exec:singletar"]);
        grunt.registerTask("test", ["exec:test"]);
        grunt.registerTask("angularTest", ["exec:angularTest"]);
    };
}());
