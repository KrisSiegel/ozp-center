/*
 * Details view spec Suite.
 */
describe("Details View", function() {
  
    var APP_FIXTURE = getJSONFixture('views/App.json');
    
    beforeEach(function() {
        var app = new AppsMall.Models.App(APP_FIXTURE);
        this.view = new AppsMall.Views.Details({ app: app });
    });
  
    describe("when instantiated", function() {
        
        it("should have tab-pane and details-content class", function() {
            expect(this.view.$el).toHaveClass("tab-pane");
            expect(this.view.$el).toHaveClass("details-content");
        });
        
    });
    
    describe("when rendered", function() {
        beforeEach(function() {
            this.view.render();
        });
        
        it("should render the details template", function() {
            expect(this.view.$el).toContain('div.details-block, div.details-right-bar');
        });
    });

});