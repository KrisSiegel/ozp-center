var express = require('express'),
    app = express(),
    engine = require('ejs-locals'),
    path = require('path')

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

module.exports = function (Ozone) {
    app.use(Ozone.utils.murl("amlUrl"), express.static(__dirname + '/public/'));
    app.use(app.router);

    var routes = require('./routes')(Ozone);
    app.get(Ozone.utils.murl("amlUrl"), routes.index);
    app.get(Ozone.utils.murl("amlUrl", 'manage/:service'), routes.manage);
    app.get(Ozone.utils.murl("amlUrl", 'manage/:service/:sub1'), routes.manage);
    return app;
}
