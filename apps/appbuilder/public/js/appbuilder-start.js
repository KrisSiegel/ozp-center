(function () {


    // Named 'AppBuilder' for expediency to make the App service work
    // as currently provided. merge this code into main AppBuilder
    // code?  Rework App service to not be attached to that module?
    var pageModule = angular.module('AppBuilder', ['ngRoute', 'ngResource']);

    function PageCtrl ($scope, App) {
        $scope.myapps = [];

        $scope.goToBuilder = function () {
            window.location = "build/";
        }

        App.query().$promise.then(function (data) {
            $scope.myapps = data;
        });

    }

    pageModule.controller('PageCtrl', PageCtrl);

})();
