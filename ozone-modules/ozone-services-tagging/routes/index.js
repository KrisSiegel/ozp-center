module.exports = exports = function (taggingService, baseURL, createQueryObject, Ozone) {

    var routing = Ozone.Routing,
        logger = Ozone.logger,
        taggingService = baseURL === require('../config/version.json').rest.url.tag ? taggingService.tag : taggingService.topic;


    /* GET, DELETE, PUT, POST /api/tags/tag */
    routing.get(baseURL + "/:id", function (req, res, next) {
        req.url = decodeURI(req.url);
        logger.debug("Routes(TaggingService)-->GetById-->req.url: " + req.url);
        var id = req.params.id;

        logger.debug("Routes(TaggingService)-->GetById-->id: " + id);

        taggingService.get(id, function (err, results) {
            if (err) {
                logger.error('An error has occurred: ' + err);
                res.send({
                    'error': 'An error has occurred: ' + err
                });
                return next(err);
            }

            logger.debug("Routes(TaggingService)-->GetById-->Found " + results.length + " elements.");

            res.send(results);
        });
    });

    routing.get(baseURL, function (req, res, next) {
        req.url = decodeURI(req.url);
        logger.debug("Routes(TaggingService)-->GetByQuery-->req.url: " + req.url);

        var findParams = {},
        	options = {};

		findParams = createQueryObject(req.query);

        logger.debug("Routes(TaggingService)-->GetByQuery-->findParams: " + JSON.stringify(findParams));

        taggingService.query(findParams, options, function (err, results) {
            if (err) {
                logger.error('An error has occurred: ' + err);
                res.send({
                    'error': 'An error has occurred: ' + err
                });
                return next(err);
            }
            logger.debug("Routes(TaggingService)-->GetByQuery-->results: " + JSON.stringify(results, null, 3));
            logger.debug("Routes(TaggingService)-->GetByQuery-->Found " + results.length + " elements.");

            res.send(results);
        });
    });

    // Inserts a set of tags via URI
    routing.post(baseURL, function (req, res, next) {
        req.url = decodeURI(req.url);
        logger.debug("Routes(TaggingService)-->Post-->req.url: " + req.url);

        var item = createQueryObject(req.body);

        // set created/modified date
        var now = new Date();
        item.created = now;
        item.modified = now;

        logger.debug("Routing(TaggingService)-->Post-->item: " + JSON.stringify(item, null, 3));

        taggingService.create(item, function (err, result) {
            if (err) {
                logger.error('Routing(TaggingService)-->Post-->An error has occurred: ' + err);
                res.send({
                    'error': 'An error has occurred: ' + err
                });
                return next(err);
            }

            res.send(result);
        });

    });

    routing.put(baseURL + "/:id", function (req, res, next) {
        req.url = decodeURI(req.url);
        logger.debug("Routes(TaggingService)-->Put-->req.url: " + req.url);
        var id = req.params.id;

        logger.debug("Routes(TaggingService)-->Put-->id: " + id);

        var item = createQueryObject(req.body);

        // update the modified date
        item.modified = new Date();

        logger.debug("Routing(TaggingService)-->Put-->item: " + JSON.stringify(item, null, 3));

        taggingService.update(id, item, function (err, results) {
            if (err) {
                logger.error('An error has occurred: ' + err);
                res.send({
                    'error': 'An error has occurred: ' + err
                });
                return next(err);
            }

            var elements = results;

            logger.debug("Routes(TaggingService)-->Updated: " + elements);

            res.send(elements);
        });

    });

    routing.delete(baseURL + "/:id", function (req, res, next) {
        req.url = decodeURI(req.url);
        logger.debug("Routes(TaggingService)-->Delete-->req.url: " + req.url);
        var id = req.params.id;

        logger.debug("Routes(TaggingService)-->Delete-->id: " + id);

        taggingService.delete(id, function (err, results) {
            if (err) {
                logger.error('An error has occurred: ' + err);
                res.send({
                    'error': 'An error has occurred: ' + err
                });
                return next(err);
            }

            var elements = results;

            logger.debug("Routes(TaggingService)-->Deleted: " + elements);

            res.send(elements);
        });

    });

};
