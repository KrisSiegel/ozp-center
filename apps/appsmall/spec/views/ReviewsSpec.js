/*
 * Reviews view spec Suite.
 */
describe("Reviews View", function() {
  
    var APP_FIXTURE = getJSONFixture('views/App.json'),
        BADGE_FIXTURE = getJSONFixture('views/Badges.json');
    
    beforeEach(function() {
        var app = new AppsMall.Models.App(APP_FIXTURE);
        this.view = new AppsMall.Views.Reviews({ app: app, badges: BADGE_FIXTURE.oneBadge });
    });
  
    describe("when instantiated", function() {
        
        it("should have tab-pane and reviews-content class", function() {
            expect(this.view.$el).toHaveClass("tab-pane");
            expect(this.view.$el).toHaveClass("reviews-content");
        });
        
    });
    
    describe("when rendered", function() {
        beforeEach(function() {
            this.view.render();
        });
        
        it("should render the reviews template", function() {
            expect(this.view.$el).toContain('img, div.reviews-right');
        });
    });

});