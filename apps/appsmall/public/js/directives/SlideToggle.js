/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI. SlideToggleModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: Toggles element(s) that match CSS selector in slide-toggle attribute value
 *
 * Usage: ```<[element] slide-toggle="[String]" expanded="[Boolean]"></[element]>```
 *
 * @class AppsMallUI. SlideToggleDirective
 * @static
 */ 

/**
 * @class AppsMallUI. SlideToggleDirective
 * @constructor
 * @param $timeout {Function} Angular wrapper for window.setTimeout - [API Documentation](https://docs.angularjs.org/api/ng/service/$timeout) 
 */

/**
 * CSS selector for element to get slide toggled
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {String} slide-toggle
 * @required
 */

/**
 * Boolean that determines whether element is getting expanded or contracted
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding plus scoped watcher event)**_
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
