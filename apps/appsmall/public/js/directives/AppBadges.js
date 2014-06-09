'use strict';

directivesModule.directive('appBadges', function(Dropdown) {
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
});
