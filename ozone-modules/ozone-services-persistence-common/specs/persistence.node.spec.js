/**
    The node.js unit tests for the exposed persistence API.
    This tests the API with the specified implementation rather than just testing the interface itself.
    This allows swapping out of the implementation while maintaining the same tests.
*/
module.exports = (function (Ozone) {
    describe("ozone-services-persistence", function () {
        var store = Ozone.config().getServerProperty("persistence.store");

        // This isn't ideal but works; this prevents each unit test from running until
        // the persistence service is ready.
        beforeEach(function (done) {
            Ozone.Service().on("ready", "Persistence", function () {
                done();
            });
        });

        it("Ozone.Service('Persistence').objectId()", function () {
            var id = Ozone.Service('Persistence').objectId();
            expect(id).not.toBe(undefined);
            expect(id).not.toBe(null);
            expect(id.length).toBeGreaterThan(0);
        });

        it("Ozone.Service('Persistence').Store(store).Metadata", function (done) {
            Ozone.Service("Persistence").Store(store).Metadata.set({
                meta: "testing",
                data: "127745"
            }, function (errSet, resSet) {
                expect(errSet).toBeUndefined();
                Ozone.Service("Persistence").Store(store).Metadata.get("testing", function (errGet, resGet) {
                    expect(errGet).toBeUndefined();
                    expect(resGet.length).toBeGreaterThan(0);
                    expect(resGet[0].meta).toBe("testing");
                    expect(resGet[0].data).toBe("127745");
                    Ozone.Service("Persistence").Store(store).Metadata.remove(resGet[0]._id, function (errRemove, resRemove) {
                        expect(errRemove).toBeUndefined();
                        done();
                    });
                });
            });
        });

        it("Ozone.Service('Persistence').", function (done) {
            done();
        });
    });
});
