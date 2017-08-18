"use strict";

angular.module('ngApp', [], function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    }).controller('FancyController', FancyController),


    FancyController.$inject = [];

function FancyController() {

    angular.element(document).ready(function() {
        $(".fancybox-thumb").fancybox({
            prevEffect: 'none',
            nextEffect: 'none',
            helpers: {
                title: {
                    type: 'float'
                },
                thumbs: {
                    width: 50,
                    height: 50
                }
            }
        });


    })
}
