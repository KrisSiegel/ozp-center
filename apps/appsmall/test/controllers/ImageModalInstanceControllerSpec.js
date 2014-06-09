// 'use strict';
// 
// /* jasmine specs for Image Modal Instance Controller go here */
// 
// describe('Image Modal Instance Controller', function() {
//     var rootScope, windowObj, scope, ctrl, modalInstance, currentAppToLoad, modalInstance;
//     var appService, reviewService, uploadService, personaService, searchService;
//     var currentRecordName;
// 
//     var rootScope, scope;
//     var appService, appSelectionService, reviewService, uploadService, personaService, searchService, tagService, ozoneService;
//     var preLoadedIds = [];
//     var testPersona = null, personaKey = null;
// 
//     beforeEach(function() {
//         module('amlApp.controllers');
//         module('amlApp.services');
//         module('amlApp.directives');
//     });
// 
//     afterEach(function() {
//         Ozone.mockDb.deleteAllCollections();
//     });
// 
//     // initialize controller with previewer flag set to true or false, and
//     // with preselected tags or null.
//     var initializeControllerAndModals = function(imageUrl) {
// 
//         inject(function($injector, $controller, $rootScope, $modal) {
//             rootScope = $rootScope;
//             scope = $rootScope.$new();
//             //windowObj = $window;
//             windowObj = jasmine.createSpy('$window');
// 
//             rootScope.$apply();
// 
//             var modalInstance = $modal.open({
//                 templateUrl: Ozone.utils.murl('amlUrl', '/partials/image.html'),
//                 controller: ImageModalInstanceController,
//                 backdrop: 'true',
//                 resolve: {
//                     imageUrl: function() { return imageUrl; }
//                 }
//             });
//             
//             rootScope.$apply();
// 
//             ctrl = $controller('ImageModalInstanceController', {
//                 $scope: scope, 
//                 $modalInstance: modalInstance,
//                 $rootScope: rootScope,
//                 $window: windowObj,
//                 imageUrl: imageUrl
//             });
// 
//             if (Ozone.utils.isFunction(scope.initializeController)) {
//                 scope.initializeController();
//             }
//             rootScope.$apply();
//         });
// 
//     }
// 
//     it('should load the current app from fixture data', function() {
//         initializeControllerAndModals();
//         expect(scope.imageUrl).toBeFalsy();
//     });
// 
//     it('should load the image URL from fixture data', function() {
//         var url = '/some/url';
//         initializeControllerAndModals(url);
//         expect(scope.imageUrl).toEqual(url);
//     });
// 
// });
