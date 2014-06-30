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
            expect(id).not.toBeUndefined();
            expect(id).not.toBeNull();
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

        it("Ozone.Service('Persistence').Store(store).Collection(collection).set()", function (done) {
            Ozone.Service('Persistence').Store(store).Collection("TestCollection").set(Ozone.Service("Persistence").objectId(), {
                testObj: "ftw"
            }, function (err, res) {
                expect(err).toBeUndefined();
                done();
            });
        });

        it("Ozone.Service('Persistence').Store(store).Collection(collection).get()", function (done) {
            var id = Ozone.Service("Persistence").objectId();
            Ozone.Service('Persistence').Store(store).Collection("TestCollection").set(id, {
                testObj: "ftw"
            }, function (err, res) {
                expect(err).toBeUndefined();
                Ozone.Service('Persistence').Store(store).Collection("TestCollection").get(id, function (errGet, resGet) {
                    expect(errGet).toBeUndefined();
                    expect(resGet).not.toBeUndefined();
                    expect(resGet.length).toBeGreaterThan(0);
                    expect(resGet[0].testObj).toBe("ftw");
                    done();
                });
            });
        });

        it("Ozone.Service('Persistence').Store(store).Collection(collection).remove()", function (done) {
            var id = Ozone.Service("Persistence").objectId();
            Ozone.Service('Persistence').Store(store).Collection("TestCollection").set(id, {
                testObj: "ftw"
            }, function (err, res) {
                expect(err).toBeUndefined();
                Ozone.Service('Persistence').Store(store).Collection("TestCollection").remove(id, function (errRem, resRes) {
                    expect(err).toBeUndefined();
                    done();
                });
            });
        });

        it("Ozone.Service('Persistence').Store(store).Collection(collection).query()", function (done) {
            Ozone.Service('Persistence').Store(store).Collection("TestCollectionQuery").set(Ozone.Service("Persistence").objectId(), {
                name: "Bob"
            }, function (err1, res1) {
                expect(err1).toBeUndefined();
                Ozone.Service('Persistence').Store(store).Collection("TestCollectionQuery").set(Ozone.Service("Persistence").objectId(), {
                    name: "Kris"
                }, function (err2, res2) {
                    expect(err2).toBeUndefined();
                    Ozone.Service('Persistence').Store(store).Collection("TestCollectionQuery").set(Ozone.Service("Persistence").objectId(), {
                        name: "Robert"
                    }, function (err3, res3) {
                        expect(err3).toBeUndefined();
                        Ozone.Service("Persistence").Store(store).Collection("TestCollectionQuery").query({ name: "Kris" }, undefined, function (errQuery, resQuery) {
                            expect(errQuery).toBeUndefined();
                            expect(resQuery).not.toBeUndefined();
                            expect(resQuery.length).toBeGreaterThan(0);
                            expect(resQuery[0].name).toBe("Kris");
                            done();
                        });
                    });
                });
            });
        });

        /*
        it("Ozone.Service('Persistence').", function (done) {

        });

        it("Ozone.Service('Persistence').", function (done) {

        });

        it("Ozone.Service('Persistence').", function (done) {

        });

        it("Ozone.Service('Persistence').", function (done) {

        });*/
    });
});
