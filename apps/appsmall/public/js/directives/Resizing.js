/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.ResizingModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML class directive: Resizes this element when parent resizes, so that other sibling elements do not change dimension.
 *
 * Usage: ```<[element] class="resizing"></[element]>```
 *
 * @class AppsMallUI.ResizingDirective
 * @static
 */ 

/**
 * @class AppsMallUI.ResizingDirective
 * @constructor
 */
var ResizingDirective = [function() {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            var $parentElement = $(element).parent();
            var previousWindowHeight = null;
            var resizeFunc = function() {
                var currentWindowHeight = $(window).height();
                if (previousWindowHeight !== currentWindowHeight) {
                    var currentElementHeight = $(element).height();
                    var allChildrenHeight =  _.chain($parentElement.children())
                                              .map(function(el) { return $(el).outerHeight(true); })
                                              .reduce(function(v1,v2) { return v1+v2; })
                                              .value();

                    var otherChildrenHeight = allChildrenHeight - currentElementHeight;

                    $(element).css('max-height', (currentWindowHeight - otherChildrenHeight - 30));

                    // console.log('* Element height = ' + currentElementHeight + ', other children height = ' + otherChildrenHeight);
                    // console.log('  New max height = ' + (currentWindowHeight - otherChildrenHeight - 30) + ', window height = ' + $(window).height());
                    previousWindowHeight = currentWindowHeight;
                }
            };
            resizeFunc();
            $(window).resize(resizeFunc);
        }
    };
}];

directivesModule.directive('resizing', ResizingDirective);
