/**
 *  The Import/Export module performs JSON serialization and deserialization of all module data and metadata
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.ImportExport
 *  @class Ozone.Services.ImportExport
 *  @submodule Server-Side
 */
module.exports = (function (Ozone) {
    var consts = require("../config/constants.json");

    Ozone.routing.get("/export/", { loggedIn: true }, function (req, res, next) {
        var services = Ozone.utils.safe(req, "query.service");
        Ozone.Service(consts.ExporterService).exportServices(services, function (result) {
            Ozone.routing.helpers.send(req, res, result, "Export.json", "application/json");
        });
    });

    Ozone.routing.get("/export/:service/", { loggedIn: true }, function (req, res, next) {
        Ozone.Service(consts.ExporterService).exportServices(req.params.service, function (result) {
            Ozone.routing.helpers.send(req, res, result, req.params.service + ".json", "application/json");
        });
    });
});
