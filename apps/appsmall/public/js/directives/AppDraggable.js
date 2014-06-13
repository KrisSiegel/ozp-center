/**
 * 
 *
 * @module directivesModule
 * @submodule AppDraggableModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: 
 *
 * Usage: ```<[element] app-draggable></[element]>```, 
 *
 * @class AppDraggableDirective
 * @static
 */ 

/**
 * @class AppDraggableDirective
 * @constructor
 * @param FileUpload {Object} an Angular-injected instance of {{#crossLink "FileUploadService"}}{{/crossLink}}
 */
var AppDraggableDirective = ['FileUpload', function(FileUpload) {
    function getSquareIcon(app) {
        return FileUpload.getFileUrl((app.images || { }).iconId, "icon");
    }

    function link(scope, element, attrs){
        var options = {
            scope: 'application',
            delay: 300,
            revert: 'invalid',
            cursorAt: { left: 2, bottom: 1 },
            zIndex: 999,
            helper: function(){
                $(element).data('drag', scope.app._id);
                return '<div class="draggable-container clearfix" style="pointer-events: none;">'+
                    '<div class="draggable-container-icon">' +
                    '<img src="'+getSquareIcon(scope.app)+'" alt="'+scope.app.name+'" />'+
                    '</div>'+
                    '<div class="draggable-container-info">'+
                    '<p>'+scope.app.name+'</p>'+
                    '</div>'+
                    '</div>';
            }
        };
        if(scope.startFunction) options['start'] = scope.startFunction;
        if(scope.stopFunction) options['stop'] = scope.stopFunction;

        $(element).draggable(options);
    }
    return {
        scope: {
            app: "=",
            startFunction: "=",
            stopFunction: "="
        },
        link: link
    };
}];

directivesModule.directive('appDraggable', AppDraggableDirective);
