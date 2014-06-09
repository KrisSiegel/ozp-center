/*
 * Single App Spec Suite.
 */
describe("SingleApp View", function() {
  
    var APP_FIXTURE = getJSONFixture('views/App.json');
    
    beforeEach(function() {
        var app = new AppsMall.Models.App(APP_FIXTURE);
        this.view = new AppsMall.Views.SingleApp({app: app});
    });
  
    describe("when instantiated", function() {

        it("should create a div element", function() {
            expect(this.view.el.nodeName).toEqual("DIV");
        });
        
        it("should have single-app and listing classes", function() {
            expect(this.view.$el).toHaveClass("listing");
            expect(this.view.$el).toHaveClass("single-app");
        });
        
        it("should default trait to users", function() {
            expect(this.view.trait).toEqual("users");
        });
    });
    
    describe("when rendered", function() {
        beforeEach(function() {
            this.view.render();
        });
        
        it("should render the Single App template", function() {
            expect(this.view.$el).toContain('a div.single-app-main');
        });
        
        it("should create a Trait sub view", function() {
            expect(this.view.$el).toContain('div.trait');
        });
        
    });
    
    describe("has events that", function() {
        beforeEach(function() {
            this.view.render();
        });
        
        it("should handle a mousestop with an animation", function() {
            var spyEvent = spyOnEvent(this.view.$el, 'mousestop');
            this.view.$el.trigger('mousestop');
            waits(this.view.slideSpeed + 3);
            expect(spyEvent).toHaveBeenTriggered();
            expect(this.view.$el).toContain('div.single-app-hover');
        });
        
        it("should handle a mouseleave with an animation", function() {
            var spyEvent = spyOnEvent(this.view.$el, 'mouseleave');
            this.view.$el.trigger('mouseleave');
            waits(this.view.slideSpeed + 3);
            expect(spyEvent).toHaveBeenTriggered();
            expect(this.view.$el).not.toContain('div.single-app-hover');
        });
        
        it("should handle a click event with the creation of a modal", function() {
            var spyEvent = spyOnEvent(this.view.$el.find('.app-link'), 'click');
            this.view.$el.find('.app-link').trigger('click');
            waits(3);
            expect(spyEvent).toHaveBeenTriggered();
            expect($('body')).toContain('div.modal');
            $('body div.modal, body div.modal-backdrop').remove();
        });
        
    });

});