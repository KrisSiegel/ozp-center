var express = require('express'),
    app = express(),
    routes = require('./routes'),
    ejs = require('ejs'),
    path = require('path')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

module.exports = function (Ozone) {
    app.use(Ozone.utils.murl("hudUrl"), express.static(__dirname + '/public/'));
    app.use(app.router);

    app.get(Ozone.utils.murl("hudUrl"), routes.index(Ozone));
    app.get(Ozone.utils.murl("hudUrl", "/login"), routes.login(Ozone));
    return app;
}
