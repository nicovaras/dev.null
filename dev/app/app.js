var myApp = angular.module('ngApp', [
    'fancyboxplus',
    ], function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});

(function(app){
  "use strict";
app.controller('appController', appController)
app.controller('fancyController', fancyController)

function appController($scope) {
  $scope.name = 'Robin Hood';
}

function fancyController($scope, $location, $timeout) {
        $scope.setActiveImageInGallery = function (prop, img) {
            $scope[prop] = img;
        };
        $scope.setScopeValue = function (prop, value) {
            $scope[prop] = value;
        };

    }
})(myApp);

