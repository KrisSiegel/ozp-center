/**
    Grunt tasks are strictly used for tasking and not regular usage of the application.
    Therefore this file is mostly comprised of tasks that assist in building, generating documentation
    and some basic shortcuts to make development life easier.

    The following tasks are explicitly exposed and are useful:

    grunt start-mongod (or grunt mongod): starts a MongoDB 2.4.x or 2.5.x instant with text indexing enabled. This DOES NOT work with MongoDB 2.6.x.

    grunt dropDb --db=database: a shortcut task to drop a database within MongoDB.

    grunt build: Combines the clean, yuidoc, concat, and minify tasks into a single task to support a build.

    grunt test: simply an alias that runs npm test.

    grunt angularTest: an alias that runs the bash script to start-up karma and run the unit tests against the Apps Mall frontend.
*/
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
