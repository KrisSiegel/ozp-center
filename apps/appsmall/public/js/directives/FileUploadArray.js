/**
 * 
 *
 * @module directivesModule
 * @submodule FileUploadArrayModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: Creates an array of clickable image viewing areas and corresponding HTML5 file input control to handle file uploading.
 *    This array is always bound to ```currentApp.images.screenshots.length``` and will size dynamically based on that array value.
 *
 * Usage: ```<file-upload-array></file-upload-array>```


 * 
 * @class FileUploadArrayDirective
 * @static
 */ 

/**
 * @class FileUploadArrayDirective
 * @constructor
 * @param {Object} $compile
 * @param $timeout {Function} Angular wrapper for window.setTimeout - [API Documentation](https://docs.angularjs.org/api/ng/service/$timeout) 
 * @param FileUpload {Object} an Angular-injected instance of {{#crossLink "FileUploadService"}}{{/crossLink}}
 */

/**
 * The App object containing an array of uploaded screenshot URLs
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding)**_
 *
 * @attribute {Object} current-app
 * @required
 */

var FileUploadArrayDirective = ['$compile', '$timeout', 'FileUpload', function($compile, $timeout, FileUpload) {
    var getScreenshotCount = function(currentApp) {
        return _.compact(currentApp.images.screenshots).length;
    }
    return {
        restrict: 'E',
        replace: true,
        template: '<div ng-repeat="screenshotArrayItem in currentApp.images.screenshots" >' +
                    '<div class="content-screenshot-section"><div class="content-section-content"><div class="content-section-content-image-upload">' +
                        '<file-upload app-object="currentApp" field="screenshotArrayItem" file-upload-id="{{screenshotArrayItem}}" callback="postArrayUpload" field-name="screenshot"' +
                                    ' delete-button="true" delete-callback="postDelete" parent-scope-callback="true"></file-upload>' +
                    '</div></div></div>' +
                  '</div>',
        scope: {
            currentApp: '='
        },
        link: function(scope, element, attrs) {
            scope.postArrayUpload = function(fileObject, fileUploadAttrs) {
                var emptyFieldIndex = _.findIndex(scope.currentApp.images.screenshots, function(v) { return _.isUndefined(v); });
                if (emptyFieldIndex < 0) {
                    emptyFieldIndex = scope.currentApp.images.screenshots.length;
                }

                // check if saved image is replacing a previous image
                var oldIndex = _.indexOf(scope.currentApp.images.screenshots, fileUploadAttrs.fileUploadId);

                // If image is replacing a previous image, then simple replace the old image id with the new one.
                // If previous image didn't exist, then append new imaqge to end of list.
                if (oldIndex >= 0) {
                    scope.currentApp.images.screenshots[oldIndex] = fileObject._id;
                }
                else {
                    scope.currentApp.images.screenshots[emptyFieldIndex] = fileObject._id;
                    var currentLength = scope.currentApp.images.screenshots.length;
                    scope.currentApp.images.screenshots[currentLength] = undefined;
                }
            }

            scope.postDelete = function(fileObject, fileUploadAttrs) {
                // delete image with id passed in
                scope.currentApp.images.screenshots = _.reject(scope.currentApp.images.screenshots, function(screenshotId) { return (screenshotId === fileObject._id); });
            }
         }
    }
}];

directivesModule.directive('fileUploadArray', FileUploadArrayDirective);
