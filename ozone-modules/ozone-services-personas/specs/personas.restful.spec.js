module.exports = (function (Ozone) {
    var url = "http://" + Ozone.config().getServerProperty("host");
    url = url + ":" + Ozone.config().getServerProperty("port");
    url = url + Ozone.config().getCommonProperty("urls.apiBaseUrl");
    url = url + "personas/";

    beforeEach(function (done) {
        Ozone.Service().on("ready", "Personas", function () {
            done();
        });
    });

    describe("ozone-services-personas", function () {
        it("GET " + Ozone.config().getCommonProperty("urls.apiBaseUrl") + "personas/permission/ responds with 200 and multiple records", function (done) {
            var request = require("supertest")(url);
            request.get("permission/").expect(200).set('Accept', 'application/json').end(function (err, res) {
                var j = JSON.parse(res.text);
                expect(j.length).toBeGreaterThan(0);
                done(err);
            });
        });
        it("GET " + Ozone.config().getCommonProperty("urls.apiBaseUrl") + "personas/role/ responds with 200 and multiple records", function (done) {
            var request = require("supertest")(url);
            request.get("role/").expect(200).set('Accept', 'application/json').end(function (err, res) {
                var j = JSON.parse(res.text);
                expect(j.length).toBeGreaterThan(0);
                done(err);
            });
        });
    });
});
