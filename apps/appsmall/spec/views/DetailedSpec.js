/*
 * Detailed view spec Suite.
 */
describe("Detailed View", function() {
  
    var APP_FIXTURE = getJSONFixture('views/App.json'),
        BADGE_FIXTURE = getJSONFixture('views/Badges.json');
    
    beforeEach(function() {
        var app = new AppsMall.Models.App(APP_FIXTURE);
        this.view = new AppsMall.Views.Detailed({ app: app , badges: BADGE_FIXTURE.twoBadges});
    });
  
    describe("when instantiated", function() {

        it("should create modal element", function() {
            expect(this.view.$el).toHaveClass("modal");
        });
        
        it("should have detailed-app class", function() {
            expect(this.view.$el).toHaveClass("detailed-app");
        });
        
    });
    
    describe("when rendered", function() {
        beforeEach(function() {
            this.view.render();
        });
        
        afterEach(function() {
            // Clean up the DOM after renders
            $(this.view.el).remove();
        });
        
        it("should render the Detailed template", function() {
            expect(this.view.$el).toContain('div.modal-header, div.modal-body');
        });
        
        it("should create a Trait sub view", function() {
            expect(this.view.$el).toContain('div.trait');
        });
        
        it("should create a Badge sub view", function() {
            expect(this.view.$el).toContain('div.app-badges');
        });
    });

});