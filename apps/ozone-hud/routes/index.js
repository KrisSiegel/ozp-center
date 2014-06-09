/*
 * GET home page.
 */

exports.index = function (Ozone) {
    var bundle = Ozone.config().getClientProperty("serveMinified");

    return function(req, res){
        res.render('index', { title: 'Ozone HUD', Ozone: Ozone, bundleComponents: bundle });
    }
};

exports.login = function (Ozone) {
    var bundle = Ozone.config().getClientProperty("serveMinified");

    return function(req, res){
        res.render('login', { title: 'Ozone HUD', Ozone: Ozone, bundleComponents: bundle });
    }
};
