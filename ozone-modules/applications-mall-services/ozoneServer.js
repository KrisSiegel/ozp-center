var express = require('express');
var path = require('path');

exports.init = function (app) {
// Include Express library.
    app = app || express();

    // Define route modules.
    app.enable("jsonp callback");

    //Extensive logging.
    app.configure(function () {
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
    });
    return app;
};
