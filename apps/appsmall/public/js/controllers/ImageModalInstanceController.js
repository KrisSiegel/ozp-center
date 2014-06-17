/**
 * Controller object for displaying the AppsMall home page main panel
 *
 * @module ImageModalInstanceController
 */

'use strict';

/**
 * @class ImageModalInstanceController
 * @static
 */ 

/**
 * @class ImageModalInstanceController
 * @constructor
 * @param $rootScope {Scope} Single root scope for application, and ancestor of all other scopes - [API Documentation](https://docs.angularjs.org/api/ng/service/$rootScope) 
 * @param $scope {ChildScope} Child scope that provides context for this controller - [API Documentation](https://docs.angularjs.org/api/ng/type/$rootScope.Scope) 
 * @param $modalInstance {Object} Controller for the modal instance, injected by Angular - [API Documentation](http://angular-ui.github.io/bootstrap/#/modal) 
 * @param $window {Window} Reference to browser window object - [API Documentation](https://docs.angularjs.org/api/ng/service/$window) 
 * @param {String} imageUrl
 */

 /**
  * Closes the modal form
  * @method cancel
  */

 /**
  * Get full path for the image name passed in, via Ozone API
  * @method getImage
  * @param imageName {String} 
  * @return {String} full URI path for image name passed in
  */

 /**
  * Height of the image displayed
  * @attribute {Number} imageHeight
  * @required
  */

 /**
  * URL of the image displayed, as passed in from parent controller
  * @attribute {String} imageUrl
  * @required
  */

 /**
  * Width of the image displayed
  * @attribute {Number} imageWidth
  * @required
  */


var ImageModalInstanceController = ['$rootScope', '$scope', '$modalInstance', '$window', 'imageUrl',  function($rootScope, $scope, $modalInstance, $window, imageUrl) {
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

}];
