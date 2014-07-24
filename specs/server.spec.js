/**
    The entry point for running the unit tests contained within the service container and all ozone modules.
    The main goal of this custom way of running unit tests is to allow server-side, RESTful and client-side unit tests
    to exist in all modules and to be automatically discovered and run in the correct context.

    Therefore the structure of unit tests in all ozone modules must be in the correct directory (./ozone-modules/<module>/specs/)
    and must use one of the following naming conventions:

    *.node.spec.js -> signifies a set of unit tests to be run in a node.js context
    *.restful.spec.js -> signifies a set of unit tests to be run against a running server with RESTful services registered
    *.client.spec.js -> signifies a set of unit tests that must be run within a browser context

    This file calls server.js, tells it to load the testEnvironment configuration, starts up the server as normal,
    locates all unit tests to run then runs them in the order indicated above (node then restful then client).

    TODO: The client-side currently does not function. Ideally we would use karma to run a browser instance but the
    combining and taking of files from services for client side hasn't happened yet.
*/
(function () {
    var pack = require("../package.json");
    var Ozone = require("../server")(pack.testEnvironment);
    var path = require("path");
    var fs = require("fs");
    var serviceContainerTests = [];
    var moduleServerTests = [];
    var moduleRestfulTests = [];
    var clientTests = [];

    var testRunner = function (tests) {
        if (!Ozone.utils.isArray(tests)) {
            tests = [tests];
        }
        for (var i = 0; i < tests.length; ++i) {
            require(tests[i])(Ozone);
        }
    };

    var bucketSpecFile = function (filename, container) {
        if (filename.indexOf(".node.spec.js") !== -1) {
            if (container === true) {
                serviceContainerTests.push(filename);
            } else {
                moduleServerTests.push(filename);
            }
        }

        if (filename.indexOf(".restful.spec.js") !== -1) {
            moduleRestfulTests.push(filename);
        }

        if (filename.indexOf(".client.spec.js") !== -1) {
            clientTests.push(filename);
        }
    };

    var serviceContainerTestFiles = fs.readdirSync(__dirname);
    for (var i = 0; i < serviceContainerTestFiles.length; ++i) {
        bucketSpecFile(path.resolve("specs/", serviceContainerTestFiles[i]), true);
    }

    var requiredServices = [];
    for (var i = 0; i < Ozone.config().getServerProperty("ozoneModules.services").length; ++i) {
        var services = Ozone.config().getServerProperty("ozoneModules.services")[i].services;
        var module = Ozone.config().getServerProperty("ozoneModules.services")[i].module;

        if (!Ozone.utils.isUndefinedOrNull(services) && services.length > 0) {
            for (var j = 0; j < services.length; ++j) {
                if (requiredServices.indexOf(services[j]) === -1) {
                    requiredServices.push(services[j]);
                }
            }
        }

        var p = path.resolve(__dirname, "../", "ozone-modules/");
        p = path.join(path.normalize(p + "/") + module);
        p = path.join(path.normalize(p + "/"), "specs/");
        if (fs.existsSync(p)) {
            var files = fs.readdirSync(p);
            while (files.length > 0) {
                var file = files.shift();
                bucketSpecFile(path.join(p, file));
            }
        }
    }

    var finishCallback = jasmine.getEnv().currentRunner().finishCallback;
    jasmine.getEnv().currentRunner().finishCallback = function () {
        finishCallback.apply(this, arguments);
        process.exit();
    }

//    describe("Setup Ozone Service Container", function () {
//        it("Initialize testing server", function () {
//            expect(serviceContainerTests.length).toBeGreaterThan(0);
//            expect(moduleServerTests.length).toBeGreaterThan(0);
//            expect(moduleRestfulTests.length).toBeGreaterThan(0);
//            expect(clientTests.length).toBeGreaterThan(0);
//        });
//
//        it("API initialized", function () {
//            expect(Ozone).not.toBe(undefined);
//            expect(Ozone.config().getConfig()).not.toBe(undefined);
//        });
//    });
//
//    describe("Ozone Service Container", function () {
//        it("Test Ready", function () {
//            expect(serviceContainerTests.length).toBeGreaterThan(0);
//        });
//        testRunner(serviceContainerTests);
//    });

    describe("Ozone Modules - Server Side", function () {
        it("Test Ready", function () {
            expect(moduleServerTests.length).toBeGreaterThan(0);
        });
        testRunner(moduleServerTests);
    });

//    describe("Ozone Modules - RESTful", function () {
//        it("Test Ready", function () {
//            expect(moduleRestfulTests.length).toBeGreaterThan(0);
//        });
//        testRunner(moduleRestfulTests);
//    });
//
//    describe("Ozone API - Client Side", function () {
//        it("Test Ready", function () {
//            expect(clientTests.length).toBeGreaterThan(0);
//        });
//        testRunner(clientTests);
//    });
}())
