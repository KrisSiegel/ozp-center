/**
 *  Apps Mall service's RESTful endpoint tests
 *
 *  @module Ozone.Services.AppsMall
 *  @class Ozone.Services.AppsMall.UnitTest
 *  @submodule Server-Side
 */

module.exports = (function (Ozone) {
    var url = "http://" + Ozone.config().getServerProperty("host");
    url = url + ":" + Ozone.config().getServerProperty("port");
    url = url + Ozone.config().getServerProperty("apiBasePath");
    url = url + "aml/";

    describe("applications-mall-services", function () {

    });
});
