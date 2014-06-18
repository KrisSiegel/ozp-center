/**
 * 
 *
 * @module directivesModule
 * @submodule HelpOverlayModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: Renders full help overlay on AppsMall main page, complete with keypress and button event bindings.
 *
 * Usage: ```<help-overlay></help-overlay>```
 * 
 * @class HelpOverlayDirective
 * @static
 */ 

/**
 * @class HelpOverlayDirective
 * @constructor
 * @param Persona {Object} an Angular-injected instance of {{#crossLink "PersonaService"}}{{/crossLink}}
 */
var HelpOverlayDirective = ['Persona', function(Persona) {
    function Controller($scope, $element, $attrs) {
        var keyHandler = function(event){
            switch(event.keyCode){
                case 27: //esc
                    $scope.gotIt();
                    break;
                case 37:case 38:case 65: //left, up, a
                    $scope.prev();
                    $scope.$apply();
                    break;
                case 39:case 40:case 68: //right, down, d
                    $scope.next();
                    $scope.$apply();
                    break;
            }
        };

        $scope.$watch('ngShow', function(newVal, oldVal){ //prevent scrolling when help is opened.
            if(newVal){
                $('body').addClass('stop-scroll');
                document.onkeydown = keyHandler;
            } else {
                $('body').removeClass('stop-scroll');
                delete document.onkeydown;
            }
        });

        $scope.page1Active = true;
        $scope.page2Active = false;
        $scope.activePage = 1;
        $scope.next = function(){
            $scope['page'+$scope.activePage+'Active'] = false;
            if($scope.activePage === 2)
                $scope.activePage = 1;
            else
                $scope.activePage ++;
            $scope['page'+$scope.activePage+'Active'] = true;
        }
        $scope.prev = function(){
            $scope['page'+$scope.activePage+'Active'] = false;
            if($scope.activePage === 1)
                $scope.activePage = 2;
            else
                $scope.activePage --;
            $scope['page'+$scope.activePage+'Active'] = true;
        }
        $scope.setPage = function(page){
            $scope['page'+$scope.activePage+'Active'] = false;
            $scope.activePage = page;
            $scope['page'+$scope.activePage+'Active'] = true;
        }
        $scope.gotIt = function(){
            $scope.ngShow=false;
            $scope['page'+$scope.activePage+'Active'] = false;
            $scope.page1Active = true;
            Persona.getCurrentPersonaData().then(function(currentPersonaData) {
                if(!currentPersonaData.viewedHelpPage) currentPersonaData.setViewedHelpPage(true);
            });
        }
    }
    return {
        controller: Controller,
        template:
            '<div id="helpOverlay">'+
                '<div class="mall-background"></div>'+
                '<div class="mask">'+
                    // '<img ng-click="gotIt()" class="tour-close" src="img/icon-tour-close.png" />'+
                    '<div class="tour-text-container">'+
                        '<div class="tour-text-content tour-text-1" fade-show="page1Active"></div>'+
                        '<div class="tour-text-content tour-text-2" fade-show="page2Active"></div>'+
                    '</div>'+
                    '<div class="help-menu-bar">'+
                        '<h1>Welcome to the New AppsMall</h1>'+
                        '<div class="button-group">' +
                            '<button class="btn-white" ng-click="prev()">Prev</button>' +
                            '<button class="btn-white btn-center" ng-click="gotIt()">Got It</button>' +
                            '<button class="btn-white" ng-click="next()">Next</button>' +
                        '</div>'+
                        '<div class="pagination-container clearfix">' +
                            '<span class="page-indicator" ng-class="{\'page-indicator-active\': page1Active}" ng-click="setPage(1)"></span>'+
                            '<span class="page-indicator" ng-class="{\'page-indicator-active\': page2Active}" ng-click="setPage(2)"></span>'+
                        '</div>'+
                    '</div>'+
                '</div'+
            '</div>'
        ,
        restrict: 'E',
        replace: true,
        scope: {ngShow: "="},
        transclude: 'element'
    }
}];

directivesModule.directive('helpOverlay', HelpOverlayDirective);
