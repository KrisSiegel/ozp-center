/**
    RESTful Apps Mall services

    @module AppsMall.Services.AppsMall
    @class AppsMall.Services.AppsMall
    @submodule Server-Side
*/
var baseURL = require('../conf/version.json').rest.url,
    logger,
    appHandlers = require('../AppHandlers'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

module.exports = exports = function (Ozone) {

    var routing = Ozone.Routing;
    logger = Ozone.logger;
    appHandlers.init(Ozone);

    /**
        Provides POST for reviews

        @method /api/aml/review
    */
    routing.post(baseURL + 'review', appHandlers.addReview);
    /**
        Provides GET for reviews

        @method /api/aml/reviews
    */
    routing.get(baseURL + 'reviews', appHandlers.getReviews);
    routing.post /* Maybe PUT is better.  Wait until we move to Angular interface? */ (
    		baseURL + ':action/:id', appHandlers.updateAction
    );
};
