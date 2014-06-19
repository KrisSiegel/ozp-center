/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.AppDroppableModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: Adds drop functionality to the element, so that elements with the app-draggable directive can be dropped.
 *
 * Usage: ```<[element] app-droppable></[element]>```
 *
 * @class AppsMallUI.AppDroppableDirective
 * @static
 */ 

/**
 * @class AppsMallUI.AppDroppableDirective
 * @constructor
 */
var AppDroppableDirective = [function() {
    function link(scope, element, attrs){
        function drop(event, ui ){
            var dragData = $(ui.draggable[0]).data('drag');
            this.onDropSuccess(this.dropData, dragData, event, ui)
        }
        $(element).droppable({tolerance: "pointer", scope: 'application', activeClass: 'app-drop-zone', hoverClass: 'app-drop-zone-hover', drop: drop.bind(scope)});
    }
    return {
        scope: {
            onDropSuccess: "=",
            dropData: "="
        },
        link: link
    };
}];

directivesModule.directive('appDroppable', AppDroppableDirective);
