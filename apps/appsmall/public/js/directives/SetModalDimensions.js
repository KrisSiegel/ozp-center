'use strict';

directivesModule.directive('setModalDimensions', ['$timeout', function($timeout) {
    function link(scope, element, attrs){
        $timeout(function() {
            $(element).find('.modal-image').css('height', scope.modalHeight).css('width', scope.modalWidth);
            $(element).closest('.modal.fade.in').css('height', scope.modalHeight).css('width', scope.modalWidth).css('max-height', '100%').css('max-width', '100%');
        }, 250);
    }

    return {
        scope: {
            modalHeight: "=",
            modalWidth: "="
        },
        restrict: 'A',
        link: link
    };
}]);

