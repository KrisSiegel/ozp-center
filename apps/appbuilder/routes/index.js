/*
 * GET home page.
 */

exports.index = function (Ozone) {
    var serveMinified = Ozone.config().getClientProperty("serveMinified");

    return function(req, res){
        res.render('index', { title: 'Ozone App Builder', Ozone: Ozone, bundleComponents: serveMinified });
    }
};

exports.build = function (Ozone) {
    var serveMinified = Ozone.config().getClientProperty("serveMinified");

    return function(req, res){
        res.render('build', { title: 'Ozone App Builder', Ozone: Ozone, bundleComponents: serveMinified });
    }
};
