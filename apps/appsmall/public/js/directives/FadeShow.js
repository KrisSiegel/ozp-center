/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.FadeShowModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: 
 *
 * Usage: ```<[element] fade-show="[Boolean]"></[element]>```
 *
 * @class AppsMallUI.FadeShowDirective
 * @static
 */ 

/**
 * @class AppsMallUI.FadeShowDirective
 * @constructor
 */

/**
 * Boolean flag that performs animate-show when changed to True, and animate-fade when changed to False
 *
 *  {{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter, with bound watcher event) **_
 *
 * @attribute {Boolean} fade-show
 * @optional
 */

var FadeShowDirective = [function() {
    function link(scope, element, attr) {
        if (scope[attr.fadeShow]) {
            element.addClass('animate-fade-active');
        }
        else {
            element.addClass('animate-fade-inactive');
        }
        element.addClass('animate-fade');
        scope.$watch(attr.fadeShow, function(show) {
            if (show) {
                element.removeClass('animate-fade-inactive').addClass('animate-fade-active');
            }
            else {
                element.removeClass('animate-fade-active').addClass('animate-fade-inactive');
            }
        });
    }
    return {
        link: link,
        restrict: 'A'
    }
}];

directivesModule.directive('fadeShow', FadeShowDirective);
