/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.InteractiveAppBadgesModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: Renders list of badges with interactive checkbox controls for selecting/deselecting badges
 *
 * Usage: ```<interactive-app-badges app-object="[Object]"></interactive-app-badges>```
 * 
 * @class AppsMallUI.InteractiveAppBadgesDirective
 * @static
 */ 

/**
 * @class AppsMallUI.InteractiveAppBadgesDirective
 * @constructor
 */

/**
 * Name of App object with user-interactive badges to be rendered.
 *
 * {{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(1-way name binding to ```attrs``` parameter; object with this name must exist in parent scope)**_
 *
 * @attribute {Object} app-object
 * @required
 */

var InteractiveAppBadgesDirective = [function(Dropdown) {
    var badgeNamesByLetter = {};
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="app-badges"></div>',
        link: function(scope, element, attrs) {
            var appObjectName = attrs.appObject;
            var appObject = scope.$eval(appObjectName);

            var setBadgeLetter = function(innerBadgeLetter, isChecked) {
                appObject = scope.$eval(appObjectName);
                if (!isChecked) {
                    appObject.badges.splice(appObject.badges.indexOf(innerBadgeLetter), 1);
                } else if (!_.contains(appObject.badges, innerBadgeLetter)) {
                    appObject.badges.push(innerBadgeLetter);
                }
            }

            Dropdown.getBadgeList().then(function(data) {
                badgeNamesByLetter = data;

                // adding checkbox elements to app badges div, and checking boxes that are pre-selected in appObject.badges array
                _.each(badgeNamesByLetter, function(badgeName, badgeLetter) {
                    var appHasBadge = _.contains(appObject.badges, badgeLetter);
                    $(element).append('<input type="checkbox" class="badge-checkbox editmode" data-badgeletter=' + badgeLetter + ' />' + '<label><i class="editmode badge-icon ' + badgeName + '" data-selected="' + appHasBadge + '" data-badgeletter=' + badgeLetter + '></i></label>');
                    if (appHasBadge) {
                        $(element).find('.badge-checkbox[data-badgeletter=' + badgeLetter + ']').prop('checked', true);
                        $(element).find('.badge-icon[data-badgeletter=' + badgeLetter + ']').removeClass('editmode');
                    }
                });

                // adding change event to checkboxes
                $(element).find('.badge-checkbox').bind('change', function() {
                    var isChecked = $(this).prop('checked');
                    var badgeLetter = $(this).data('badgeletter');
                    setBadgeLetter(badgeLetter, isChecked);
                    var $badgeicon = $(element).find('.badge-icon[data-badgeletter=' + badgeLetter + ']');
                    if (isChecked) {
                        $badgeicon.data('selected', true).removeClass('editmode');
                    } else {
                        $badgeicon.data('selected', false).addClass('editmode');
                    }

                });
            });
        }
    };
}];

directivesModule.directive('interactiveAppBadges', InteractiveAppBadgesDirective);
