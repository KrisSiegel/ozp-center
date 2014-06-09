/*
 * Badge subview Spec Suite.
 */
describe("Badge View", function() {
    
    var TEST_BADGES = getJSONFixture('views/Badges.json');
    
    describe("when instantiated", function() {
        
        beforeEach(function() {
            this.view = new AppsMall.Views.Badge();
        });
        
        it("should create a div element", function() {
            expect(this.view.el.nodeName).toEqual("DIV");
        });
        
        it("should have the app-badges class", function() {
            expect(this.view.$el).toHaveClass("app-badges");
        });
        
        it("should default badges", function() {
            expect(this.view.badges).toBeDefined();
        });
        
    });
    
    describe("when rendered", function() {
        
        it("should render if supplied with one badge", function() {
            this.view = new AppsMall.Views.Badge({ badges: TEST_BADGES.oneBadge });
            this.view.render();
            expect(this.view.$el.find('i').length).toEqual(1);
        });
        
        it("should render if supplied with two badges", function() {
            this.view = new AppsMall.Views.Badge({ badges: TEST_BADGES.twoBadges });
            this.view.render();
            expect(this.view.$el.find('i').length).toEqual(2);
        });
        
        it("should render if supplied with three badges", function() {
            this.view = new AppsMall.Views.Badge({ badges: TEST_BADGES.allBadges });
            this.view.render();
            expect(this.view.$el.find('i').length).toEqual(3);
        });
        
    });
    
});