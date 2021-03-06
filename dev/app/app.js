(function() {

    "use strict";

    angular.module('ngApp', ["ngTable"], function($interpolateProvider) {
            $interpolateProvider.startSymbol('[[{');
            $interpolateProvider.endSymbol('}]]');
        }).controller('DefaultController', ["$scope",
            function DefaultController($scope) {
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
        ])
        .controller('EciController', ["$scope", "$http", "$filter", "NgTableParams",

            function EciController($scope, $http, $filter, NgTableParams) {

                $http({
                    method: 'GET',
                    url: '/assets/eci/data_original.csv'
                }).then(function successCallback(response) {
                    var lines = response.data.split('\n');
                    var data = []
                    $scope.header = lines[0].split(',');
                    for (var i = 1; i < lines.length; i++) {
                        var row = {}
                        var line = lines[i].split(',');
                        for (var j = 0; j < line.length; j++) {
                            row[$scope.header[j]] = line[j];
                        }
                        data.push(row);
                    }

                    $scope.columns = []
                    for (var j = 0; j < $scope.header.length; j++) {
                        $scope.columns.push({ title: $scope.header[j], field: $scope.header[j], show: true })
                    }

                    var tmp = $scope.columns[0]
                    $scope.columns[0] = $scope.columns[$scope.columns.length - 1]
                    $scope.columns[$scope.columns.length - 1] = tmp
                    $scope.tableParams = new NgTableParams({
                        page: 1, // show first page
                        count: 10, // count per page
                    }, {
                        total: data.length, // length of data
                        getData: function($defer, params) {
                            var orderedData = params.sorting() ?
                                $filter('orderBy')(data, params.orderBy()) :
                                data;

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(),
                                params.page() * params.count()));
                        }
                    });

                    $scope.esFalse = function(x) {
                        return x.decae == 'False';
                    }

                });

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
        ])
        .controller('Eci2Controller', ["$scope", "$http",

            function Eci2Controller($scope, $http) {
                $scope.curr = 0;
                $scope.isZoomed = false;

                $scope.prev = function(){
                    $scope.curr--;
                    addEciLrChart($scope.datasets[$scope.curr])
                }

                $scope.next = function(){
                    $scope.curr++;
                    addEciLrChart($scope.datasets[$scope.curr])
                }

                $scope.zoom = function(){
                    $scope.isZoomed = !$scope.isZoomed;
                    addEciLrChart($scope.datasets[$scope.curr], $scope.isZoomed)
                }

                angular.element(document).ready(function() {

                    $http({
                        method: 'GET',
                        url: '/assets/eci/lr.csv'
                    }).then(function(response) {
                        var lines = response.data.split('\n');
                        $scope.datasets = [];
                        $.each(lines, function(i,line) {
                            $scope.datasets.push(line.split(','));
                        });
                        startChart()
                        addEciLrChart($scope.datasets[0])

                    });

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
                });
            }
        ])

})();
