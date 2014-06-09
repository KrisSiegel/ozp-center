/*
 * Overview view spec Suite.
 */
describe("Overview View", function() {
  
    var APP_FIXTURE = getJSONFixture('views/App.json'),
        BADGE_FIXTURE = getJSONFixture('views/Badges.json');
    
    beforeEach(function() {
        var app = new AppsMall.Models.App(APP_FIXTURE);
        this.view = new AppsMall.Views.Overview({ app: app, badges: BADGE_FIXTURE.oneBadge });
    });
  
    describe("when instantiated", function() {
        
        it("should be the active tab", function() {
            expect(this.view.$el).toHaveClass("active");
        });
        
        it("should have tab-pane and overview-content class", function() {
            expect(this.view.$el).toHaveClass("tab-pane");
            expect(this.view.$el).toHaveClass("overview-content");
        });
        
    });
    
    describe("when rendered", function() {
        beforeEach(function() {
            this.view.render();
        });
        
        it("should render the overview template", function() {
            expect(this.view.$el).toContain('img, div.overview-right-bar');
        });
    });

});