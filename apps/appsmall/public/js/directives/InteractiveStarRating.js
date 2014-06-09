'use strict';

directivesModule.directive('interactiveStarRating', function() {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="trait"><i class="rating-star" ng-click="setDynRating(1)"></i><i class="rating-star" ng-click="setDynRating(2)"></i><i class="rating-star" ng-click="setDynRating(3)"></i>' + '<i class="rating-star" ng-click="setDynRating(4)"></i><i class="rating-star" ng-click="setDynRating(5)"></i></div>',
        link: function(scope, element, attrs) {
            scope.setDynRating = function(newRating) {
                scope.rating = newRating;
                scope.$parent.rating = newRating;
            }
            // sets rating from scope of controller. (RWP: MAY NOT WORK FOR MULTIPLE STAR RATING ELEMENTS THAT REFERENCE THE SAME CONTROLLER.)
            scope.setRatingFunc = function(srating, calledFromWatch) {
                if (!_.isUndefined(srating) || ($(element).find('i').length === 0)) {
                    srating = common.rangeBounds((parseInt(srating) || 0), 0, 5);
                    $(element).attr('title', ('Average rating: ' + srating + ' (' + getRatingText(scope.ratingScale, srating) + ')'));
                    // fill in rating stars
                    $(element).find('i.rating-star').each(function(index, starElement) {
                        if (srating > index) {
                            $(starElement).removeClass('icon-empty-star').addClass('icon-star');
                        } else {
                            $(starElement).addClass('icon-empty-star').removeClass('icon-star');
                        }
                    });
                }
            }

            // checking if rating attribute exists in directive tag, regardless of value (undefined or otherwise)
            scope.$watch('rating', function() {
                scope.setRatingFunc(scope.rating, true);
            });
            scope.$watch('reviewText', function() {
                scope.$parent.reviewText = scope.reviewText;
            });
        }
    };
});

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
