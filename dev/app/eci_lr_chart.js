function startChart(){
    $('#lr_chart').bind('mousemove touchmove touchstart', function(e) {
        var chart, point, i, event;

        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
            chart = Highcharts.charts[i];
            event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
            point = chart.series[0].searchPoint(event, true); // Get the hovered point

            if (point) {
                point.highlight(e);
            }
        }
    });

    Highcharts.Pointer.prototype.reset = function() {
        return undefined;
    };

    Highcharts.Point.prototype.highlight = function(event) {
        this.onMouseOver(); // Show the hover marker
        this.series.chart.tooltip.refresh(this); // Show the tooltip
        this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };

}

function addEciLrChart(dataset, zoom) {
    var names = ['HAZ', "WAZ", "BMIZ"]
    var colors = [0, 5, 7]
    $('#lr_chart').empty();
    for (var i = 0; i < 3; i++) {
        $('<div class="chart">').appendTo('#lr_chart').highcharts(
            eciLrChartConfig(dataset.slice(i * 4, i * 4 + 4), names[i], colors[i], zoom));
    }
}


function eciLrChartConfig(dataset, name, color, zoom) {
    dataset = Highcharts.map(dataset, function(val, j) {
        return [
            [1, 2, 3, 4][j], parseFloat(val)
        ];
    });

    var min_z=-4
    var max_z=4;
    if(zoom){
        min_z=-2;
        max_z=2;
    }

    return {
        chart: {
            marginLeft: 40,
            spacingTop: 20,
            spacingBottom: 20
        },

        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        xAxis: {
            tickInterval: 1,
            min: 1,
            max: 4,

            labels: {
                format: 'checkup #{value}'
            }
        },
                title: {
            text: name,
            align: 'left',
            margin: 0,
            x: 30
        },
        yAxis: {
            tickInterval: 1,
            min: min_z,
            max: max_z,
            title: {
                text: "Z-value"
            }
        },
        tooltip: {
            positioner: function() {
                return {
                    x: 100,
                    y: 9 // align to title
                };
            },
            borderWidth: 0,
            backgroundColor: 'none',
            pointFormat: 'Z-value: {point.y}',
            headerFormat: '',
            shadow: false,
            style: {
                fontSize: '18px'
            },
            valueDecimals: 3
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: 0,
            y: -20,
            floating: true,
            backgroundColor: '#fafafa',
            borderWidth: 1
        },
        series: [{
            regression: true,
            regressionSettings: {
                color: 'rgba(0, 0, 0, .5)',
                dashStyle: 'dash'
            },
            data: dataset,
            name: name,
            type: "spline",
            shadow: false,
            color: Highcharts.getOptions().colors[color],
            fillOpacity: 0.3,
            tooltip: {
                valueSuffix: ''
            }
        }]
    };

}
