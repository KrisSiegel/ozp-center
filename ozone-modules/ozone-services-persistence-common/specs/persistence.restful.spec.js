module.exports = (function (Ozone) {
    var url = "http://" + Ozone.config().getServerProperty("host");
    url = url + ":" + Ozone.config().getServerProperty("port");
    url = url + Ozone.config().getServerProperty("apiBasePath");
    url = url + "persistence/";

    describe("ozone-services-persistence", function () {

    });
});
