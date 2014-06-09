/*
 * App colletion test suite.
 */
describe("App Collection", function() {

    describe("when fetched", function() {
        
        // Dummy data which is used to fake a server response
        var APP_COLLECTION = getJSONFixture('collections/Apps.json');
        
        beforeEach(function() {
            
            // Used to intercept ajax call and inject dummy data
            spyOn($, 'ajax').andCallFake(function(options) {
                options.success(APP_COLLECTION);
            });
            this.collection = new AppsMall.Collections.App();
            
        });
        
        afterEach(function() {
            this.collection = undefined;
        })
        
        it("should return the records array", function() {
            
            this.collection.fetch();
            expect(this.collection.length).toEqual(APP_COLLECTION.records.length);
            
            // Loop over dummy data model...
            _.each(APP_COLLECTION.records, function(item) {
                var model = this.collection.get(item._id);
                // ... and compare each value to the model
                _.each(item, function(value, key) {
                    expect(model.get(key)).toEqual(value);
                });
            }, this);
            
        });
        
    });
    
});