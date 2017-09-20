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

            function EciController($scope, $http) {
                angular.element(document).ready(function() {
                    $('#container2').bind('mousemove touchmove touchstart', function(e) {
                        var chart,
                            point,
                            i,
                            event;

                        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
                            chart = Highcharts.charts[i];
                            event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
                            point = chart.series[0].searchPoint(event, true); // Get the hovered point

                            if (point) {
                                point.highlight(e);
                            }
                        }
                    });
                    /**
                     * Override the reset function, we don't need to hide the tooltips and crosshairs.
                     */
                    Highcharts.Pointer.prototype.reset = function() {
                        return undefined;
                    };

                    /**
                     * Highlight a point by showing tooltip, setting hover state and draw crosshair
                     */
                    Highcharts.Point.prototype.highlight = function(event) {
                        this.onMouseOver(); // Show the hover marker
                        this.series.chart.tooltip.refresh(this); // Show the tooltip
                        this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
                    };

                    /**
                     * Synchronize zooming through the setExtremes event handler.
                     */
                    function syncExtremes(e) {
                        var thisChart = this.chart;

                        if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
                            Highcharts.each(Highcharts.charts, function(chart) {
                                if (chart !== thisChart) {
                                    if (chart.xAxis[0].setExtremes) { // It is null while updating
                                        chart.xAxis[0].setExtremes(e.min, e.max, undefined,
                                            false, { trigger: 'syncExtremes' });
                                    }
                                }
                            });
                        }
                    }

                    // Get the data. The contents of the data file can be viewed at
                    // https://github.com/highcharts/highcharts/blob/master/samples/data/activity.json
                    $.getJSON(
                        'https://www.highcharts.com/samples/data/jsonp.php?filename=activity.json&callback=?',
                        function(activity) {
                            $.each(activity.datasets, function(i, dataset) {

                                // Add X values
                                dataset.data = Highcharts.map(dataset.data, function(val, j) {
                                    return [activity.xData[j], val];
                                });

                                $('<div class="chart">')
                                    .appendTo('#container2')
                                    .highcharts({
                                        chart: {
                                            marginLeft: 40, // Keep all charts left aligned
                                            spacingTop: 20,
                                            spacingBottom: 20
                                        },
                                        title: {
                                            text: dataset.name,
                                            align: 'left',
                                            margin: 0,
                                            x: 30
                                        },
                                        credits: {
                                            enabled: false
                                        },
                                        legend: {
                                            enabled: false
                                        },
                                        xAxis: {
                                            crosshair: true,
                                            events: {
                                                setExtremes: syncExtremes
                                            },
                                            labels: {
                                                format: '{value} km'
                                            }
                                        },
                                        yAxis: {
                                            title: {
                                                text: null
                                            }
                                        },
                                        tooltip: {
                                            positioner: function() {
                                                return {
                                                    x: this.chart.chartWidth - this
                                                        .label.width, // right aligned
                                                    y: 10 // align to title
                                                };
                                            },
                                            borderWidth: 0,
                                            backgroundColor: 'none',
                                            pointFormat: '{point.y}',
                                            headerFormat: '',
                                            shadow: false,
                                            style: {
                                                fontSize: '18px'
                                            },
                                            valueDecimals: dataset.valueDecimals
                                        },
                                        series: [{
                                            data: dataset.data,
                                            name: dataset.name,
                                            type: dataset.type,
                                            color: Highcharts.getOptions().colors[
                                                i],
                                            fillOpacity: 0.3,
                                            tooltip: {
                                                valueSuffix: ' ' + dataset.unit
                                            }
                                        }]
                                    });
                            });
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
                })
            }
        ])

})();
