/*
 * App model test suite.
 */
describe("App Model", function() {

    describe("when instantiated", function() {
        
        var APP_MODEL = getJSONFixture('models/App.json');
        
        it("should expose default attributes", function() {
            this.model = new AppsMall.Models.App();
            expect(this.model.get("users")).toEqual(0);
            expect(this.model.get("rating")).toEqual(0);
            expect(this.model.get("numRatings")).toEqual(0);
            expect(this.model.get("version")).toEqual(1.0);
            expect(this.model.get("accessible")).toBeTruthy();
        });
        
        it("should overwrite default values", function() {
            this.model = new AppsMall.Models.App(APP_MODEL);
            // Compare each dummy value to the model
            _.each(APP_MODEL, function(value, key) {
                expect(this.model.get(key)).toEqual(value);
            }, this);
        });
    });
    
});