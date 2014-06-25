/**
 *  The Import/Export module performs JSON serialization and deserialization of all module data and metadata
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.ImportExport
 *  @class Ozone.Services.ImportExport
 *  @submodule Server-Side
 */
module.exports = (function (callback, Ozone) {
    var consts = require("./config/constants.json");
    Ozone.Service(consts.ImporterService, require("./services/importerApi"));
    Ozone.Service(consts.ImporterService).init(Ozone);
    var baseImportUrl = require('./config/version.json').rest.url.import
    require("./routes/importerRests")(Ozone.Service(consts.ImporterService), baseImportUrl, Ozone)

    Ozone.Service(consts.ExporterService, require("./services/exporterApi")(Ozone));
    require("./routes/exporterRests")(Ozone);
});
