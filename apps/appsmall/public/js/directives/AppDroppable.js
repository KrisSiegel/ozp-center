/**
 * 
 *
 * @module directivesModule
 * @submodule AppDroppableModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * @class AppDroppableDirective
 * @static
 */ 

/**
 * @class AppDroppableDirective
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
