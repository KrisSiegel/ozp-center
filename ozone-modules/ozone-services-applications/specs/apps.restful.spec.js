module.exports = (function (Ozone) {
    var url = "http://" + Ozone.config().getServerProperty("host");
    url = url + ":" + Ozone.config().getServerProperty("port");
    url = url + Ozone.config().getCommonProperty("urls.apiBaseUrl");
    url = url + "apps/";

    beforeEach(function (done) {
        Ozone.Service().on("ready", "App", function () {
            done();
        });
    });

    describe("ozone-services-applications", function () {
        var appDef = {
            name: "App Test 1",
            shortname: "AppTest1",
            version: "2",
            workflowState: "Published",
            featured: false,
            descriptionShort: "This is my short description",
            description: "This is my long description"
        };

        it("POST " + Ozone.config().getCommonProperty("urls.apiBaseUrl") + "apps/app/ responds with 200", function (done) {
            var request = require("supertest")(url);
            request.post("app/").send(appDef).set('Accept', 'application/json').expect(200).end(function (err, res) {
                expect(err).toBe(null);
                expect(res).not.toBe(undefined);
                var j = JSON.parse(res.text);
                appDef._id = j[0]._id;
                done();
            });
        });

        it("GET " + Ozone.config().getCommonProperty("urls.apiBaseUrl") + "apps/app/:id responds with 200", function (done) {
            var request = require("supertest")(url);
            request.get("app/" + appDef._id).expect(200).set('Accept', 'application/json').end(function (err, res) {
                var j = JSON.parse(res.text);
                expect(j[0].shortname).toBe(appDef.shortname);
                done(err);
            });
        });

        it("PUT " + Ozone.config().getCommonProperty("urls.apiBaseUrl") + "apps/app/:id responds with 200", function (done) {
            var request = require("supertest")(url);
            appDef.shortname = "AppTest9";
            request.put("app/" + appDef._id).send(appDef).set('Accept', 'application/json').expect(200, done);
        });

        it("DELETE " + Ozone.config().getCommonProperty("urls.apiBaseUrl") + "apps/app/:id responds with 200", function (done) {
            var request = require("supertest")(url);
            request.del("app/" + appDef._id).expect(200, done);
        });
    });
});
