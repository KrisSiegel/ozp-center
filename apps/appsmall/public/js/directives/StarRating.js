/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.StarRatingModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: Renders the star rating trait as HTML, with 0-5 stars filled in depending on the rating number.
 *
 * Usage: ```<star-rating static-rating="[Number]" num-stars="[{{Number}}]"></star-rating>```
 * 
 * @class AppsMallUI.StarRatingDirective
 * @static
 */ 

/**
 * @class AppsMallUI.StarRatingDirective
 * @constructor
 */

/**
 * Star rating that is set once, and does not change if modified.
 *
 * {{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding)**_
 *
 * @attribute {Number} static-rating
 * @optional
 */

/**
 * Star rating that can be dynamically refreshed via watch event
 *
 * {{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 1-way binding plus scoped watcher event)**_
 *
 * @attribute {Number} num-stars 
 * @optional
 */

var StarRatingDirective = [function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            staticRating: '=',
            numStars: '@'
        },
        template: '<div class="trait"><i class="rating-star"></i><i class="rating-star"></i><i class="rating-star"></i><i class="rating-star"></i><i class="rating-star"></i></div>',
        link: function(scope, element, attrs) {
            var setRatingFunc = function(srating, calledFromWatch) {
                    if (!_.isUndefined(srating) || ($(element).find('i').length === 0)) {
                        srating = common.rangeBounds((parseInt(srating) || 0), 0, 5);
                        $(element).attr('title', ('Average rating: ' + srating + ' (' + getRatingText((scope.$parent || {}).ratingScale, srating) + ')'));
                        // fill in rating stars
                        $(element).find('i').each(function(index, starElement) {
                            if (srating > index) {
                                $(starElement).removeClass('icon-empty-star').addClass('icon-star');
                            } else {
                                $(starElement).addClass('icon-empty-star').removeClass('icon-star');
                            }
                        }, this);
                    }
                }
            setRatingFunc(scope.staticRating, false);

            // checking if dynrating attribute exists in directive tag, regardless of value (undefined or otherwise)
            if (_.has(attrs, 'numStars')) {
                scope.$watch('numStars', function() {
                    setRatingFunc(attrs.numStars, true);
                });
            }
        }
    };
}];

// CLEANUP: MOVE TO SERVICE AND INJECT SERVICE INTO DIRECTIVE
function getRatingText(ratingScale, rating) {
    var matchedRatingObject = _.find((ratingScale || []), function(ratingToFind) {
        return (ratingToFind.rating == rating)
    });
    if (matchedRatingObject) {
        return matchedRatingObject.name;
    } else {
        return "None";
    }
}

directivesModule.directive('starRating', StarRatingDirective);
