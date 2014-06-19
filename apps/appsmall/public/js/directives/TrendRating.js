/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI. TrendratingModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * @class AppsMallUI. TrendratingDirective
 * @static
 */ 

/**
 * HTML element directive: Renders the trending rating trait as HTML, with 0-3 flames filled in depending on the rating number.
 *
 * Usage: ```<trendrating srating="[Number]" dynrating="[{{Number}}]"></trendrating>```
 * 
 * @class AppsMallUI. TrendratingDirective
 * @constructor
 * @deprecated
 */

/**
 * Trend rating that is set once, and does not change if modified.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding)**_
 *
 * @attribute {Number} srating
 * @optional
 */

/**
 * Trend rating that can be dynamically refreshed via watch event
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 1-way binding plus scoped watcher event)**_
 *
 * @attribute {Number} dynrating
 * @optional
 */

var TrendratingDirective = [function() {
    var trendingText = {
        0: 'Not Trending',
        1: 'Trending: Warm',
        2: 'Trending: Hot',
        3: 'Trending: On fire'
    };
    return {
        restrict: 'E',
        replace: true,
        scope: {
            srating: '=',
            dynrating: '@'
        },
        template: '<div class="trait"><i class="icon-fire icon-white trending"></i><i class="icon-fire icon-white trending"></i><i class="icon-fire icon-white trending"></i></div>',
        link: function(scope, element, attrs) {
            var setRatingFunc = function(srating, calledFromWatch) {
                    srating = common.rangeBounds((parseInt(srating) || 0), 0, 3)
                    $(element).attr('title', ('Average rating: ' + srating + ' (' + trendingText[srating] + ')'));
                    $(element).find('span.trending-message').remove();

                    // fill in trending flames
                    $(element).find('i').each(function(index, starElement) {
                        if (srating > index) {
                            $(starElement).removeClass('icon-white');
                        } else {
                            $(starElement).addClass('icon-white');
                        }
                    }, this);
                    $(element).append('<span class="trending-message">' + trendingText[srating] + '</span>');
                }
            setRatingFunc(scope.rating, false);

            // checking if dynrating attribute exists in directive tag, regardless of value (undefined or otherwise)
            if (_.has(attrs, 'dynrating')) {
                scope.$watch('dynrating', function() {
                    setRatingFunc(attrs.dynrating, true);
                });
            }
        }
    };
}];

directivesModule.directive('trendrating', TrendratingDirective);
