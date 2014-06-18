/**
 * 
 *
 * @module directivesModule
 * @submodule AppBadgesModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: Renders a visual list of badges corresponding to badges field.
 *
 * Usage: ```<app-badges badges="[ArrayName]" dynbadges="[{{ArrayName}}]"></app-badges>```
 *
 * ...where {{ArrayName}} denotes that the array name is being evaluated via Handlebars.
 *
 * @class AppBadgesDirective
 * @static
 */ 

/**
 * @class AppBadgesDirective
 * @constructor
 * @param Dropdown {Object} an Angular-injected instance of {{#crossLink "DropdownService"}}{{/crossLink}}
 */

/**
 * An array of badge names that is set once.  Badges do not change if modified.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding)**_
 *
 * @attribute {Array} badges
 * @optional
 */

/**
 * An array of badge names that can be dynamically refreshed via watch event
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 1-way binding plus scoped watcher event)**_
 *
 * @attribute {Array} dynbadges 
 * @optional
 */


var AppBadgesDirective = ['Dropdown', function(Dropdown) {
    var badgeNamesByLetter = {};
    return {
        restrict: 'E',
        replace: true,
        scope: {
            badges: '=',
            dynbadges: '@'
        },
        template: '<div class="app-badges"></div>',
        link: function(scope, element, attrs) {
            var addBadgeFunc = function(badges, calledFromWatch) {
                $(element).find('i.badge-icon').remove();
                _.each((badges || []), function(badgeLetter) {
                    if (_.has(badgeNamesByLetter, badgeLetter)) {
                        $(element).append('<i class="badge-icon ' + badgeNamesByLetter[badgeLetter] + '"></i>');
                    }
                });
            }

            Dropdown.getBadgeList().then(function(data) {
                badgeNamesByLetter = data;
                addBadgeFunc(scope.badges, false)

                // checking if dynbadges attribute exists in directive tag, regardless of value (undefined or otherwise)
                if (_.has(attrs, 'dynbadges')) {
                    scope.$watch('dynbadges', function() {
                        addBadgeFunc(attrs.dynbadges, true);
                    });
                }
            });
        }
    };
}]

directivesModule.directive('appBadges', AppBadgesDirective);
