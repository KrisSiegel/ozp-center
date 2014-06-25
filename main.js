/**
    This is the main entry point into the application as specified in package.json.
    It simply requires the server.js file and passes in the environment that should be used
    for configurations.
*/
(function () {
    require("./server")(require("./package.json").environment);
}());
