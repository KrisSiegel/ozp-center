/**
 * Controller object for displaying the AppsMall home page main panel
 *
 * @module AppModalInstanceController
 */

'use strict';

/**
 * @class AppModalInstanceController
 * @static
 */ 

/**
 * @class AppModalInstanceController
 * @constructor
 * @param $scope {ChildScope} Child scope that provides context for this controller - [API Documentation](https://docs.angularjs.org/api/ng/type/$rootScope.Scope) 
 * @param $modal {Object} Angular service that creates modal instances - [API Documentation](http://angular-ui.github.io/bootstrap/#/modal) 
 * @param $modalInstance {Object} Controller for the modal instance, injected by Angular - [API Documentation](http://angular-ui.github.io/bootstrap/#/modal) 
 * @param $rootScope {Scope} Single root scope for application, and ancestor of all other scopes - [API Documentation](https://docs.angularjs.org/api/ng/service/$rootScope) 
 * @param $sce {Object} Service that provides Strict Contextual Escaping - [API Documentation](https://docs.angularjs.org/api/ng/service/$sce) 
 * @param Persona {Object} an Angular-injected instance of {{#crossLink "PersonaService"}}{{/crossLink}}
 * @param Review {Object} an Angular-injected instance of {{#crossLink "ReviewService"}}{{/crossLink}}
 * @param Tag {Object} an Angular-injected instance of {{#crossLink "TagService"}}{{/crossLink}}
 * @param AppOrComponent {Object} an Angular-injected instance of {{#crossLink "AppOrComponentService"}}{{/crossLink}}
 * @param FileUpload {Object} an Angular-injected instance of {{#crossLink "FileUploadService"}}{{/crossLink}}
 * @param OzoneCommon {Object} an Angular-injected instance of {{#crossLink "OzoneCommonService"}}{{/crossLink}}
 * @param {Object} currentApp
 * @param {Array} currentTags
 * @param {Boolean} previewer
 */
var AppModalInstanceController = ['$scope', '$modal', '$modalInstance', '$rootScope', '$sce', 'Persona', 'Review', 'Tag', 'AppOrComponent', 'FileUpload', 'OzoneCommon', 'currentApp', 'currentTags', 'previewer',  function($scope, $modal, $modalInstance, $rootScope, $sce, Persona, Review, Tag, AppOrComponent, FileUpload, OzoneCommon, currentApp, currentTags, previewer) {

     var converter = new Showdown.converter();

     $scope.allUserReviews = [];
     $scope.visibleUserReviews = [];
     $scope.ratingScale = Review.getRatings();
     $scope.rating = 0;
     $scope.reviewText = '';
     $scope.favoriteApps = [];
     $scope.isPreviewer = previewer;

     var ratingNumbers = _.pluck($scope.ratingScale, 'rating');

     $scope.personaData = {};

     var userNamePromise = Persona.getCurrentPersonaData().then(function(currentPersonaData) {
         console.log('Persona data: ' + JSON.stringify(currentPersonaData));
         $scope.userName = currentPersonaData.username;
         $scope.roles = currentPersonaData.roles;
         $scope.isLoggedIn = (_.isString(currentPersonaData.username) && !_.isEmpty(currentPersonaData.username));
         $scope.favoriteApps = currentPersonaData.favoriteApps;
         $scope.personaData = currentPersonaData;
     });

     $scope.launchedByUser = true;

     $scope.hasUserReviews = false;
     $scope.averageStarRatingText = "";
     $scope.averageRating = 0;
     $scope.tagsForApp = currentTags || [];

     // loading user reviews for current app
     if (_.isEmpty(currentApp)) {
         $scope.currentApp = {};
         $scope.reviews = [];
         $scope.fullDescriptionHtml = '';
     } else {
         $scope.currentApp = _.clone(currentApp);
         // converting description from Markdown to HTML, then marking HTML as safe
         $scope.fullDescriptionHtml = $sce.trustAsHtml(converter.makeHtml(currentApp.description || ''));
         $scope.reviews = getReviewsFromServer();
         userNamePromise.then(function (val) {
             getUserReviewFromServer(currentApp._id);
         });
     }
     $scope.currentApp.orgTag = ''
     Tag.getTags({
         uri: '/AppsMall/Apps/' + $scope.currentApp.shortname,
         topic: '/AppsMall/Organization/'
     }).then(function (tags) {
         if(!_.isEmpty(tags))
             $scope.currentApp.orgTag =  tags[0].tag;
     });

     $scope.currentApp.images.featuredBannerUrl = FileUpload.getFileUrl($scope.currentApp.images.featuredBannerId, "featuredBanner");
     $scope.currentApp.images.smallBannerUrl = FileUpload.getFileUrl($scope.currentApp.images.smallBannerId, "smallBanner");
     $scope.currentApp.images.iconUrl = FileUpload.getFileUrl($scope.currentApp.images.iconId, "icon");
     $scope.currentApp.images.screenshotUrls = _.chain($scope.currentApp.images.screenshots)
                                                .compact()
                                                .map(function(ssId) { return FileUpload.getFileUrl(ssId, 'screenshot') })
                                                .value();

     // if no tags were passed in, then get tags via service call.
     if (Ozone.utils.isUndefinedOrNull(currentTags)) {
         Tag.getTags({uri: AppOrComponent.getUri($scope.currentApp), topic: '/AppsMall/App/'}).then(function(allTagObjects) {
             $scope.tagsForApp = _.chain(allTagObjects).pluck('tag').uniq().value();
         });
     }

     console.log("New AppModalInstanceController for app " + (currentApp || {})._id);

     $scope.cancel = function() {
         $modalInstance.dismiss('cancel');
     };

     $scope.openChildImageModal = function(imageUrl) {
          var modalInstance = $modal.open({
              templateUrl: Ozone.utils.murl('amlUrl', '/partials/image.html'),
              controller: ImageModalInstanceController,
              backdrop: 'true',
              resolve: {
                  imageUrl: function() { return imageUrl; }
              }
          });
          modalInstance.opened.then(function(selectedItem) {
              console.log('Image modal opened = ' + JSON.stringify(selectedItem));
          });
          modalInstance.result.then(function(selectedItem) {
              console.log('Image modal selected item = ' + JSON.stringify(selectedItem));
          }, function() {
              console.log('Image modal dismissed at: ' + new Date());
          });
     }

     $scope.openApp = function() {
         if (!$scope.isPreviewer) {
             $rootScope.$broadcast('openApp', $scope.currentApp);
         }
     }

     $scope.setBookmark = function(currentApp) {
         if (!$scope.isPreviewer) {
             var isBookmarked = $scope.isBookmarked(currentApp);
             Persona.addOrRemoveFavoriteApp(currentApp.shortname, !isBookmarked).then(function(newFavoriteApps) {
                 $scope.favoriteApps = newFavoriteApps;
                 $rootScope.$broadcast('changeFavoriteApps', newFavoriteApps);
             })
         }
     }

     $scope.isBookmarked = function(currentApp) {
         return (_.contains($scope.favoriteApps, (currentApp || {}).shortname));
     }

     $scope.getImage = function(imageName) {
         return OzoneCommon.getAmlUri('img/' + imageName);
     }

     $scope.submitRating = function() {
         if (!$scope.isPreviewer) {
             if (!_.isEmpty($scope.userName)) {
                 var ratingAsNumber = parseInt($scope.rating) || 0;
                 if (_.contains(ratingNumbers, ratingAsNumber)) {
                     $scope.errorMessage = '';
                     Review.submit($scope.currentApp, ratingAsNumber, $scope.userName, $scope.reviewText).then(function(data) {
                         getReviewsFromServer();
                     });
                 } else {
                     $scope.errorMessage = 'You have not selected a rating.';
                 }
             }
             else {
                 $scope.errorMessage = 'You must log in before submitting a review.';
             }
         }
     };

     $scope.filterReviewsByRating = function(ratingNumber) {
         var ratingAsInt = parseInt(ratingNumber);
         if (ratingAsInt) {
             $scope.starRatingFilter = ratingAsInt;
             $scope.visibleUserReviews = _.filter($scope.allUserReviews, function(userReview) {
                 return (userReview.starRating === ratingAsInt);
             });
         }
         else {
             $scope.starRatingFilter = null;
             $scope.visibleUserReviews = $scope.allUserReviews;
         }
     }

     $scope.reviewsAreFiltered = function() {
         return ($scope.visibleUserReviews !== $scope.allUserReviews);
     }

     function getUserReviewFromServer(appId) {
         if (appId) {
             // querying for a single review with unique (appId, userName) value.
             var dataQuery = Review.get(appId, $scope.userName).then(function(data) {
                 var reviewsForAppAndUser = data || [];
                 $scope.currentUserReview = (reviewsForAppAndUser.shift() || {});
                 $scope.rating = $scope.currentUserReview.starRating || 0;
                 $scope.reviewText = $scope.currentUserReview.reviewText || '';
             });
         }
     }

     function getReviewsFromServer() {
         var appId = $scope.currentApp._id;
         if (appId) {
             var dataQuery = Review.get(appId).then(function(data) {
                 var reviewsForApp = data || [];
                 $scope.allUserReviews = reviewsForApp;
                 $scope.visibleUserReviews = $scope.allUserReviews;
                 $scope.numRatings = reviewsForApp.length;
                 $scope.hasUserReviews = ($scope.numRatings > 0);

                 if ($scope.hasUserReviews) {
                     var rawAverage = _.reduce(reviewsForApp, function(memo, review) {
                         return memo + parseInt(review.starRating);
                     }, 0) / $scope.numRatings;

                     $scope.starRatingMap = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
                     _.each(reviewsForApp, function(review) {
                         var ratingAsInt = parseInt(review.starRating);
                         if (_.isNumber($scope.starRatingMap[ratingAsInt])) {
                             $scope.starRatingMap[ratingAsInt] = $scope.starRatingMap[ratingAsInt] + 1;
                         }
                     });
                     console.log(JSON.stringify($scope.starRatingMap));

                     $scope.averageRatingAsInt = parseInt(rawAverage);
                     $scope.averageStarRatingText = parseFloat(rawAverage).toFixed(1).toString();
                     // This is not that clean, but probably not that
                     // crucial to get it from the real source.
                     $scope.currentApp.rating = rawAverage;
                 } else {
                     $scope.averageRatingAsInt = 0;
                     $scope.numRatings = 0;
                     $scope.averageStarRatingText = "";
                 }

             });
         }
     }
}];
