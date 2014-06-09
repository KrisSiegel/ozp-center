'use strict';

directivesModule.directive('ngConfirmClick', [function() {
    function link(scope, element, attr) {
        var msg = attr.ngConfirmClick || "Are you sure?";
        var clickAction = attr.confirmedClick;
        element.bind('click', function (event) {
            if(window.confirm(msg)) {
                scope.$eval(clickAction);
            }
        });
    }
    return {
        link: link
    }
}]);
