/**
 * 
 *
 * @module directivesModule
 * @submodule SlideToggleModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: Toggles element(s) that match CSS selector in slide-toggle attribute value
 *
 * Usage: ```<[element] slide-toggle="[String]" expanded="[Boolean]"></[element]>```
 *
 * @class SlideToggleDirective
 * @static
 */ 

/**
 * @class SlideToggleDirective
 * @constructor
 * @param $timeout {Function} Angular wrapper for window.setTimeout - [API Documentation](https://docs.angularjs.org/api/ng/service/$timeout) 
 */

/**
 * CSS selector for element to get slide toggled
 *
 * _**(static 1-way binding)**_
 *
 * @attribute {String} slide-toggle
 * @required
 */

/**
 * Boolean that determines whether element is getting expanded or contracted
 *
 * _**(2-way binding attribute with scoped watcher event; responds to modification)**_
 *
 * @attribute {Boolean} expanded
 * @optional
 */

var SlideToggleDirective = ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        scope: {expanded: '='},
        link: function(scope, element, attrs) {
            var isExpanded = scope.expanded || false;

            var toggleExpand = function(){
                var target = document.querySelector(attrs.slideToggle);
                if(target === null) return;
                var content = document.querySelector(attrs.slideToggle + '-wrap');
                if(content === null) return;

                if(isExpanded) {
                    //timeout needed to ensure the elements have been compiled by angular and will have the proper height
                    $timeout(function(){
                        content.style.border = '1px solid rgba(0,0,0,0)';
                        var y = content.clientHeight;
                        content.style.border = 0;
                        target.style.height = y + 'px';
                    }, 1 )
                } else {
                    target.style.height = '0px';
                }
            }

            element.bind('click', function() {
                isExpanded = !isExpanded;
                toggleExpand();
            });
            scope.$watch('expanded', function(newVal){
                isExpanded = newVal || false;
                toggleExpand();
            });
            toggleExpand();
        }
    }
}];

directivesModule.directive('slideToggle', SlideToggleDirective);
