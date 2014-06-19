/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI. AmlNavLinksModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: Renders HTML for navigation links dropdown menu.
 *
 * Usage: ```<aml-nav-links show-help="true"></aml-nav-links>```
 * 
 * @class AppsMallUI. AmlNavLinksDirective
 * @static
 */ 

/**
 * @class AppsMallUI. AmlNavLinksDirective
 * @constructor
 * @param OzoneCommon {Object} an Angular-injected instance of {{#crossLink "OzoneCommonService"}}{{/crossLink}}
 * @param Persona {Object} an Angular-injected instance of {{#crossLink "PersonaService"}}{{/crossLink}}
 */

/**
 * If set to true, then the navigation links will always display the Help page link.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding)**_
 *
 * @attribute {String} show-help 
 * @optional
 */

var AmlNavLinksDirective = ['OzoneCommon', 'Persona', function(OzoneCommon, Persona) {
    // HTML template for top-right navigation links.  Will add permission logic later.
    var htmlTemplate =
        '<div style="float:right"><div class="btn-group admin-menu">' +
            '<a class="btn dropdown-toggle" data-toggle="dropdown" href="#"><i class="icon-cog"></i></a>' +
            '<ul class="dropdown-menu">' +
            '<li style="display:none;"><a id="appMgmtLink" title="Admin-level management of user submitted apps."><span class="icon-key"></span>App Management</a></li>' +
            '<li style="display:none;"><a id="tagMgmtLink" title="Admin-level management of tags."><span class="icon-key"></span>Tag Management</a></li>' +
            '<li style="display:none;"><a id="categoryMgmtLink" title="Admin-level management of categories."><span class="icon-key"></span>Category Management</a></li>' +
            '<li style="display:none;"><a id="collectionMgmtLink" title="Admin-level management of collections."><span class="icon-key"></span>Collection Management</a></li>' +
            '<li style="display:none;"><a id="helpScreen" title="Help screen." ng-click="toggleHelp()"><span class="icon-support"></span>Help</a></li>'
    '</ul>' +
    '</div></div>';

    return {
        restrict: 'E',
        scope: {showHelp: '='},
        template: htmlTemplate,
        controller: function($scope) {
            $scope.toggleHelp = function() {
                $scope.showHelp = ($scope.showHelp ? undefined : true);
            };

        },
        link: function(scope, element, attrs) {
            Persona.getCurrentPersonaData().then(function(currentPersonaData) {
                if (currentPersonaData.hasAppManagerAccess) {
                    $(element).find('#appMgmtLink').prop("href", OzoneCommon.getAmlUri('manage/apps/'));
                    $(element).find('#appMgmtLink').closest('li').show();
                }
                if (currentPersonaData.hasTagManagerAccess) {
                    $(element).find('#tagMgmtLink').prop("href", OzoneCommon.getAmlUri('manage/tags/'));
                    $(element).find('#tagMgmtLink').closest('li').show();
                }
                if (currentPersonaData.hasCollectionManagerAccess) {
                    $(element).find('#categoryMgmtLink').prop("href", OzoneCommon.getAmlUri('manage/categories/'));
                    $(element).find('#categoryMgmtLink').closest('li').show();
                }
                if (currentPersonaData.hasCategoryManagerAccess) {
                    $(element).find('#collectionMgmtLink').prop("href", OzoneCommon.getAmlUri('manage/collections/'));
                    $(element).find('#collectionMgmtLink').closest('li').show();
                }
                if (scope.showHelp !== undefined){
                    $(element).find('#helpScreen').closest('li').show();
                }
            });
        }
    };
}];

directivesModule.directive('amlNavLinks', AmlNavLinksDirective);
