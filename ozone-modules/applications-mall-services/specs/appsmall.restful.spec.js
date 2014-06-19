/**
    Apps Mall service's RESTful endpoint tests
*/
module.exports = (function (Ozone) {
    var url = "http://" + Ozone.config().getServerProperty("host");
    url = url + ":" + Ozone.config().getServerProperty("port");
    url = url + Ozone.config().getServerProperty("apiBasePath");
    url = url + "aml/";

    describe("applications-mall-services", function () {

    });
});
