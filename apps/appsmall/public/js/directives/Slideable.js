/**
 * 
 *
 * @module directivesModule
 * @submodule SlideableModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * @class SlideableDirective
 * @static
 */ 

/**
 * @class SlideableDirective
 * @constructor
 */
var SlideableDirective = [function() {
    return {
        restrict:'C',
        compile: function (element, attr) {
            // wrap tag
            var contents = element.html();
            var elementId = attr.id + '-wrap';
            element.html('<div id="'+elementId+'" class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

            return function postLink(scope, element, attrs) {
                // default properties
                attrs.duration = (!attrs.duration) ? '500ms' : attrs.duration;
                attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
                element.css({
                    'overflow': 'hidden',
                    'height': '0px',
                    'transitionProperty': 'height',
                    'transitionDuration': attrs.duration,
                    'transitionTimingFunction': attrs.easing
                });
            };
        }
    };
}];

directivesModule.directive('slideable', SlideableDirective);
