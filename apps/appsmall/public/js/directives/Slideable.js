/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.SlideableModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML class directive: Creates div element with slide functionality in browser.  Slide duration and easing 
 * are set from attributes.
 *
 * Usage: ```<[element] class="slideable" duration="[Int]ms" easing="ease-in-out"></[element]>```
 *
 * @class AppsMallUI.SlideableDirective
 * @static
 */ 

/**
 * @class AppsMallUI.SlideableDirective
 * @constructor
 */

/**
 * Duration of slide event, as measured in milliseconds
 *
 * {{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {Number} duration
 * @required
 */

/**
 * Easing type for slide event; defaults to 'ease-in-out'
 *
 * {{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {String} easing
 * @required
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
