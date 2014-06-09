module.exports = (function (Ozone) {
    describe("ozone-services-status", function (done) {
        var url = "http://" + Ozone.config().getServerProperty("host");
        url = url + ":" + Ozone.config().getServerProperty("port");
        url = url + Ozone.config().getCommonProperty("urls.apiBaseUrl");

        it(Ozone.config().getCommonProperty("urls.apiBaseUrl") + "status/ responds with 200", function (done) {
            var request = require("supertest")(url);
            request.get("status/").expect(200).end(done);
        });
    });
});
