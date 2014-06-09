'use strict';

directivesModule.directive('fileUpload', function(FileUpload) {
    var setStatusMessage = function(msgFunc, msg, isError) {
        if (_.isFunction(msgFunc)) {
            if (isError) {
                msgFunc({errorMessage: msg});
            }
            else {
                msgFunc({successMessage: msg});
            }
        }
        else if (isError) {
            alert('Error: ' + msg);
        }
    };

    // Performing dimension check using one of: min H/W, max H/W, or selected H/W values.
    // Standard JS truthiness checks are made on each value, which is fine because valid height and width values should not be zero.
    var dimensionCheck = function(height, width, dimensionChecker) {
        if ((dimensionChecker.minHeight && (height < dimensionChecker.minHeight)) ||
            (dimensionChecker.minWidth && (width < dimensionChecker.minWidth))) {
                return ("Uploaded image must be at least " + dimensionChecker.minWidth + " pixels in width, and at least " + dimensionChecker.minHeight + " pixels in height.");
        }

        if ((dimensionChecker.maxHeight && (height > dimensionChecker.maxHeight)) ||
            (dimensionChecker.maxWidth && (width > dimensionChecker.maxWidth))) {
                return ("Uploaded image cannot be more than " + dimensionChecker.maxWidth + " pixels in width, or more than " + dimensionChecker.maxHeight + " pixels in height.");
        }
        if (_.isArray(dimensionChecker.validHeights) && _.isArray(dimensionChecker.validWidths) && 
             (dimensionChecker.validHeights.length > 0) && (dimensionChecker.validWidths.length > 0)
        ) {
            // converting arrays X and Y into [[x0,y0], ...] array of arrays
            var pairedValues = _.zip(dimensionChecker.validHeights, dimensionChecker.validWidths);

            if (!_.find(pairedValues, function(pair) { return ((pair[0] === height) && (pair[1] === width)); })) {
                // create array of "A x B" dimension strings
                var pixelDimensions = pairedValues.map(function(pair) {
                    if (pair[0] && pair[1]) {
                        return (pair[0] + 'x' + pair[1] + ' px');
                    }
                });
                return ("Uploaded image must have the following dimensions: " +  common.humanizedArrayString(pixelDimensions, true) + ".");
            }
        }
        return true;
    };

    return {
        restrict: 'E',
        replace: true,
        scope: {
            appObject: '=',
            deleteButton: '@',
            field: '@',
            fileUploadId: '@',
            fieldName: '@',
            minHeight: '@',
            minWidth: '@',
            maxHeight: '@',
            maxWidth: '@',
            validHeights: '@',
            validWidths: '@',
        },
        template: '<div><input type="file" name="image" style="display:none" />' +
                      '<div class="clickable-file-upload-area" ng-hide="fileUploadId"><span class="icon-upload icon-camera-outline"></span><br /> <p>Upload New Image</p> </div>' +
                      '<div class="image-viewing-area" ng-show="fileUploadId"><div class="image-viewing-area-container"><img src="{{getFileUrl(fileUploadId, fieldName)}}" /></div>' +
                      '<a href="#" class="icon-pencil edit-image-link" ng-hide="deleteButton"></a>' +
                      '<a href="#" class="icon-artwork delete-image-link icon-minus" ng-show="deleteButton"></a>' +
                  '</div></div>',
        link: function(scope, element, attrs) {
            // copying service function into scope
            scope.getFileUrl = FileUpload.getFileUrl;

            // DOM elements that will stay within scope of bind event
            var $uploadClickArea = $(element).find('.clickable-file-upload-area');
            var $imageView = $(element).find('.image-viewing-area');
            var $fileInput = $(element).find('input[type=file]');
            var $imageElement = $(element).find('.image-viewing-area > img');
            var $imageUpdateElement = $(element).find('.image-viewing-area .edit-image-link');
            var $imageDeleteElement = $(element).find('.image-viewing-area .delete-image-link');

            var getCallback = function(callbackAttrName) {
                if (attrs[callbackAttrName]) {
                    if (attrs.parentScopeCallback) {
                        return attrs[callbackAttrName] && (_.isFunction(scope.$parent[attrs[callbackAttrName]])) && scope.$parent[attrs[callbackAttrName]];
                    }
                    else {
                        return attrs[callbackAttrName] && (_.isFunction(scope[attrs[callbackAttrName]])) && scope[attrs[callbackAttrName]];
                    }
                }
            };

            var clickEditEvent = function() {
                $fileInput.trigger('click');
            };

            var clickDeleteEvent = function() {
                if (_.isFunction(deleteCallback)) {
                    deleteCallback({_id: scope.fileUploadId}, attrs);
                }
            };

            var callback = getCallback('callback');
            var deleteCallback = getCallback('deleteCallback');

            $uploadClickArea.click(clickEditEvent);
            $imageUpdateElement.click(clickEditEvent);
            $imageDeleteElement.click(clickDeleteEvent);

            // add change event to hidden file input, fired after user selects a file from file browser
            $fileInput.bind('change', function(event) {
                var app = scope[attrs.appObject] || scope.$parent[attrs.appObject];

                // throw error if app object doesn't exist
                if (!_.isObject(app)) {
                    return setStatusMessage(scope.setStatusMessage, 'Invalid app.', true);
                }
                scope.app = app;
                var appAttribute = attrs.field || 'image';
                var files = event.target.files;
                var fileObj = files[0];


                if (files && fileObj && (fileObj instanceof File)) {
                    var postUploadCallback = function(data) {
                        data = data || {};
                        if (_.isArray(data)) {
                            data = data.shift(); //get first element of array
                        }
                        if (data._id) {
                            scope.$eval('app.' + appAttribute + ' = "' + data._id + '"');  // using scope.eval to assign attributes with dots
                            // setImageFunction(data._id);
                            if (callback) {
                                callback(data, attrs);
                            }
                            else {
                                setStatusMessage(scope.setStatusMessage, (data.filename + ' (' + (data.length || 0) + ' bytes) has been successfully uploaded.'), false);
                            }
                        }
                        else {
                            setStatusMessage(scope.setStatusMessage, (data.error || 'Error saving file.'), true);
                        }
                    };

                    // getting dimension values and converting to numeric form. validHeights and validWidths may contain a list of numeric values.
                    var dimensionChecker = {
                        minHeight: parseInt(attrs.minHeight),
                        minWidth: parseInt(attrs.minWidth),
                        maxHeight: parseInt(attrs.maxHeight),
                        maxWidth: parseInt(attrs.maxWidth),
                        validHeights: _((attrs.validHeights || '').split(/\,\s*/)).map(function(v) { return parseInt(v); } ).compact().value(),
                        validWidths: _((attrs.validWidths || '').split(/\,\s*/)).map(function(v) { return parseInt(v); } ).compact().value()
                    };

                    // If any truthy dimension values exist in object, then perform dimension check
                    if (_(dimensionChecker).values().compact().any()) {
                        // performing image height/width check using HTML5 File API
                        var reader = new FileReader();
                        var fileImage  = new Image();
                        reader.readAsDataURL(fileObj);
                        reader.onload = function(_file) {
                            fileImage.src = _file.target.result;
                            fileImage.onload = function() {
                                // performing dimension check, where method returns True or an error string.
                                var dimensionCheckResult = dimensionCheck(this.height, this.width, dimensionChecker);
                                if (dimensionCheckResult === true) {
                                    FileUpload.upload(fileObj).then(postUploadCallback);
                                }
                                else {
                                    setStatusMessage(scope.setStatusMessage, dimensionCheckResult, true);
                                }
                            }
                        }

                    }
                    else {
                        FileUpload.upload(fileObj).then(postUploadCallback);
                    }
                }
            }); // end $fileInput.bind('change', ...)
        }
    }
});
