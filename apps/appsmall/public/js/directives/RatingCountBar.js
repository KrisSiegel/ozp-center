/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.RatingCountBarModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: 
 *
 * Usage: ```<rating-count-bar app="[Object]"></rating-count-bar>```
 * 
 * @class AppsMallUI.RatingCountBarDirective
 * @static
 */ 

/**
 * @class AppsMallUI.RatingCountBarDirective
 * @constructor
 */

/**
 * The App object to reference for rating counts; uses ```app.ratings``` for ratings count.
 *
 * {{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding)**_
 *
 * @attribute {Object} app
 * @required
 */

var RatingCountBarDirective = [function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            app: '='
        },
        template: '<span class="rating-count"></span>',
        link: function(scope, element, attrs) {
            var appRatings = scope.app && scope.app.ratings;
            var isFeaturedApp = ($(element).closest('.featured-app-inner-frame').length > 0);
            var appRatingText = '(No rating)';
            if (appRatings) {
                appRatingText = '(' + appRatings + ' ratings)';
            }
            if (isFeaturedApp) {
                $(element).hide();
            }
            $(element).text(appRatingText);
        }
    }
}];

directivesModule.directive('ratingCountBar', RatingCountBarDirective);
