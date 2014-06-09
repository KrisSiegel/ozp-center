/*
 * Category model test suite.
 */
describe("Category Model", function() {
    
    var CATEGORY_MODEL = getJSONFixture('models/Category.json');
    
    describe("when instantiated", function() {
        
        it("should accept attributes upon construction", function() {
            this.model = new AppsMall.Models.Category(CATEGORY_MODEL);
            _.each(CATEGORY_MODEL, function(value, key) {
                expect(this.model.get(key)).toEqual(value);
            }, this);
        });
    });
    
});