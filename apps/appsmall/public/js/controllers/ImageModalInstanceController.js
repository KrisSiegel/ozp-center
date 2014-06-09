'use strict';

var ImageModalInstanceController = ['$rootScope', '$scope', '$modalInstance', '$window', 'imageUrl',
    function($rootScope, $scope, $modalInstance, $window, imageUrl) {

        $scope.imageUrl = imageUrl;
        $scope.imageHeight = $window.outerHeight;
        $scope.imageWidth = $window.outerWidth;

        console.log("New ImageModalInstanceController for url " + imageUrl);

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.getImage = function(imageName) {
            return OzoneCommon.getAmlUri('img/' + imageName);
        }
    }
];
