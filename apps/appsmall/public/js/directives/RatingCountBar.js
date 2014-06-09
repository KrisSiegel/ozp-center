'use strict';

directivesModule.directive('ratingCountBar', function() {
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
});
