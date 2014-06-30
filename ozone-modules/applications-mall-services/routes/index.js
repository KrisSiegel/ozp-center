/**
 *  RESTful Apps Mall services
 *
 *  @module Ozone.Services.AppsMall
 *  @class Ozone.Services.AppsMall
 *  @submodule Server-Side
 */

var baseURL = require('../conf/version.json').rest.url,
    logger,
    appHandlers = require('../AppHandlers'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

module.exports = exports = function(Ozone) {

    var routing = Ozone.Routing;
    logger = Ozone.logger;
    appHandlers.init(Ozone);

    /**
     *  Provides POST for reviews
     *
     *  @method /api/aml/review_POST
     */
    routing.post(baseURL + 'review', appHandlers.addReview);

    /**
     *  Provides GET for reviews
     *
     *  @method /api/aml/reviews_GET
     */
    routing.get(baseURL + 'reviews', appHandlers.getReviews);

    /**
     *  Provides POST for existing reviews
     *  (Maybe PUT is better.  Wait until we move to Angular interface? )
     *
     *  @method /api/aml/action/id_POST
     */
    routing.post(baseURL + ':action/:id', appHandlers.updateAction);
};
