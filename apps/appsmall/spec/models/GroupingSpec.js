/*
 * Grouping model test suite.
 */
describe("Grouping Model", function() {

    var GROUPING_MODEL = getJSONFixture('models/Grouping.json');
    
    describe("when instantiated", function() {
        
        it("should accept attributes upon construction", function() {
            this.model = new AppsMall.Models.Grouping(GROUPING_MODEL);
            _.each(GROUPING_MODEL, function(value, key) {
                expect(this.model.get(key)).toEqual(value);
            }, this);
        });
    });
    
});