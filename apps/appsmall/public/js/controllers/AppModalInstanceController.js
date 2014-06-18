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

    /**
     * [Showdown](https://github.com/coreyti/showdown) conversion object used to convert Markdown into HTML
     * @attribute {Object} converter
     * @private
     * @writeOnce
     */
     var converter = new Showdown.converter();

     /**
      * A list of all reviews loaded for this app, which may or may not all be visible.
      * @attribute {Array} allUserReviews
      * @required
      */
     $scope.allUserReviews = [];

     /**
      * A list of only visible reviews loaded for this app
      * @attribute {Array} visibleUserReviews
      * @required
      */
     $scope.visibleUserReviews = [];

     /**
      * Star rating scale from {{#crossLink "ReviewService"}}{{/crossLink}}.getRatings
      * @attribute {Array} ratingScale
      * @required
      */
     $scope.ratingScale = Review.getRatings();

     /**
      * Star rating as entered by user
      * @attribute {Number} rating
      * @required
      */
     $scope.rating = 0;

     /**
      * Review text as entered by user
      * @attribute {String} reviewText
      * @required
      */
     $scope.reviewText = '';

     /**
      * A list of all favorite apps from Persona object of logged-in user
      * @attribute {Array} favoriteApps
      * @required
      */
     $scope.favoriteApps = [];

     /**
      * Indicates whether this modal was launched by AppsMall main page or App Submission previewer, and is True only for the latter.
      * @attribute {Boolean} isPreviewer
      * @required
      */
     $scope.isPreviewer = previewer;

     /**
      * A list of all valid numerical ratings
      * @attribute {Array} ratingNumbers
      * @private
      * @writeOnce
      */
     var ratingNumbers = _.pluck($scope.ratingScale, 'rating');

     /**
      * Persona data for the currently logged-in user
      * @attribute {Object} personaData
      * @required
      */
     $scope.personaData = {};

     /**
      * Angular Promise object used to query for persona data
      * @attribute {PromiseObject} userNamePromise
      */
     var userNamePromise = Persona.getCurrentPersonaData().then(function(currentPersonaData) {
         console.log('Persona data: ' + JSON.stringify(currentPersonaData));
         $scope.userName = currentPersonaData.username;
         $scope.roles = currentPersonaData.roles;
         $scope.isLoggedIn = (_.isString(currentPersonaData.username) && !_.isEmpty(currentPersonaData.username));
         $scope.favoriteApps = currentPersonaData.favoriteApps;
         $scope.personaData = currentPersonaData;
     });

     /**
      * Indicates whether this modal was launched by the user
      * @attribute {Boolean} launchedByUser
      * @required
      */
     $scope.launchedByUser = true;

     /**
      * Indicates whether the app has user reviews, regardless of visibility
      * @attribute {Boolean} hasUserReviews
      * @required
      */
     $scope.hasUserReviews = false;

     /**
      * Stringified numeric value of all visible reviews
      * @attribute {String} averageStarRatingText
      * @required
      */
     $scope.averageStarRatingText = "";

     /**
      * Average star rating of all visible reviews
      * @attribute {Number} averageRating
      * @required
      */
     $scope.averageRating = 0;

     /**
      * List of tag names, for all tags tagged to the current app
      * @attribute {Array} tagsForApp
      * @required
      */
     $scope.tagsForApp = currentTags || [];

     /**
      * The app passed in by the parent controller
      * @attribute {Object} currentApp
      * @required
      */
     $scope.currentApp = {};

     /**
      * List of user reviews from the database
      * @attribute {Array} reviews
      * @required
      */
     $scope.reviews = [];

     /**
      * Description text after converting from Markdown to HTML and marking HTML as safe
      * @attribute {TrustedValueHolderType} fullDescriptionHtml
      * @required
      */
     $scope.fullDescriptionHtml = '';


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

     /**
      * Closes the modal form
      * @method cancel
      */
     $scope.cancel = function() {
         $modalInstance.dismiss('cancel');
     };

     /**
      * Launches child modal to display screenshot image
      * @method openChildImageModal
      * @param imageUrl {String} full path URL for image to be viewed in child modal
      */
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

     /**
      * Launches the app passed in into a separate window
      * @method openApp
      * @param currentApp {Object} the app to be launched
      */
     $scope.openApp = function() {
         if (!$scope.isPreviewer) {
             $rootScope.$broadcast('openApp', $scope.currentApp);
         }
     }

     /**
      * Toggles bookmarked status for app passed in
      * @method setBookmark
      * @param currentApp {Object} the app to toggle bookmark status for
      */
     $scope.setBookmark = function(currentApp) {
         if (!$scope.isPreviewer) {
             var isBookmarked = $scope.isBookmarked(currentApp);
             Persona.addOrRemoveFavoriteApp(currentApp.shortname, !isBookmarked).then(function(newFavoriteApps) {
                 $scope.favoriteApps = newFavoriteApps;
                 $rootScope.$broadcast('changeFavoriteApps', newFavoriteApps);
             })
         }
     }

     /**
      * Checks whether the current app is bookmarked
      * @method isBookmarked
      * @param currentApp {Object} the app to check bookmark status
      * @return {Boolean} True only if the app passed in is bookmarked
      */
     $scope.isBookmarked = function(currentApp) {
         return (_.contains($scope.favoriteApps, (currentApp || {}).shortname));
     }

     /**
      * Get full path for the image name passed in, via Ozone API
      * @method getImage the local-path image name
      * @param imageName {String} 
      * @return {String} full URI path for image name passed in
      */
     $scope.getImage = function(imageName) {
         return OzoneCommon.getAmlUri('img/' + imageName);
     }

     /**
      * Submits user rating to the database and refreshes user ratings
      * @method submitRating
      */
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

     /**
      * Filters visible reviews so that only apps with the rating number passed in are visible
      * @method filterReviewsByRating
      * @param ratingNumber {Number} a star rating number.  Only apps with this star rating will be visible.
      */
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

     /**
      * Checks whether all user reviews for the currently loaded app are visible
      * @method reviewsAreFiltered
      */
     $scope.reviewsAreFiltered = function() {
         return ($scope.visibleUserReviews !== $scope.allUserReviews);
     }

     /**
      * Load user reviews for app passed in
      * @method getUserReviewFromServer
      * @param appId {String} ID of selected App object, used to query for reviews
      * @private
      */
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

     /**
      * Load all user reviews for currently selected app, and gets rating counts for all reviews
      * @method getReviewsFromServer
      * @private
      */
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
