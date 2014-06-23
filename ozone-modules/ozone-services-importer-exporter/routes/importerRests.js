/**
 *  The Import/Export module performs JSON serialization and deserialization of all module data and metadata
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.ImportExport
 *  @class Ozone.Services.ImportExport
 *  @submodule Server-Side
 */
module.exports = (function (importService, baseUrl, Ozone) {
    var routing = Ozone.Routing,
        logger = Ozone.logger;

    //imports a file via the import service
    routing.post(baseUrl, function(req, res, next){
        req.url = decodeURI(req.url);
        if(Ozone.Utils.isEmptyObject(req.files) || Ozone.Utils.isEmptyObject(req.files.importFile)){
            var error = 'No import file found';
            logger.error('Routing(ImportService)-->Post--> importing error:' + error);
            res.send({
                'error': 'An error has occurred: ' + error
            });
        } else {
            var filePath = req.files.importFile.path;
            logger.debug("Routing(ImportService)-->Post--> importing:" + filePath);
            importService.import(filePath, function (err, results) {
                if (err) {
                    logger.error('Routing(ImportService)-->Post--> importing error:' + err);
                    res.send({
                        'error': 'An error has occurred: ' + err
                    });
                } else {
                    res.send(results);
                }
            });
        }
    });
});