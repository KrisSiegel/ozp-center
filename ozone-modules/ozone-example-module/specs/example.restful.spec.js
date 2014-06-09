module.exports = (function (Ozone) {
    describe("ozone-example-module", function (done) {
        var url = "http://" + Ozone.config().getServerProperty("host");
        url = url + ":" + Ozone.config().getServerProperty("port");
        url = url + Ozone.config().getCommonProperty("urls.apiBaseUrl");

        it(Ozone.config().getCommonProperty("urls.apiBaseUrl") + "example/ responds with 200", function (done) {
            var request = require("supertest")(url);
            request.get("example/").expect(200).end(done);
        });
    });
});
