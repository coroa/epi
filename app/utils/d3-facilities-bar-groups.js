import D3EmberComputed from './d3-ember-computed';
import Enums from '../enums';

var BarGroup = D3EmberComputed(
        'capacity',
        'requirement',
        function() {
            var duration, yScale, xSubScale, color;

            function exports(selection) {
                var bars = selection.selectAll(".bar")
                        .data(function(d) {
                            var width = xSubScale.rangeBand()/3,
                                requirement = d.get('requirement') || 0,
                                capacity = d.get('capacity') || 0,
                                difference = requirement - capacity;

                            return [ { x: 0*width, width: width,
                                       label: "Requirement",
                                       value: requirement },
                                     { x: 1*width, width: width,
                                       label: "Capacity",
                                       value: capacity },
                                     { x: 2*width, width: width,
                                       label: (difference > 0
                                               ? "Missing" : "Surplus"),
                                       value: difference } ];
                        });
                bars.enter()
                    .append("rect")
                    .attr("class", "bar")
                    .attr("height", 0)
                    .attr("width", function(d) {return d.width;})
                    .attr("x", function(d) {return d.x; })
                    .attr("y", yScale(0));
                bars // update
                    .attr("fill", function(d) {return color(d.label);})
                    .transition()
                    .duration(duration)
                    .attr("width", function(d) {return d.width;})
                    .attr("y", function(d) {return yScale(Math.abs(d.value));})
                    .attr("height", function(d) {
                        return yScale(0) - yScale(Math.abs(d.value));
                    });

                bars.exit()
                    .transition()
                    .duration(duration)
                    .attr("y", yScale(0))
                    .attr("height", 0)
                    .remove();
            }

            exports.duration = function(_) {
                if (!arguments.length) { return duration; }
                duration = _;
                return exports;
            };

            exports.yScale = function(_) {
                if (!arguments.length) { return yScale; }
                yScale = _;
                return exports;
            };

            exports.xSubScale = function(_) {
                if (!arguments.length) { return xSubScale; }
                xSubScale = _;
                return exports;
            };

            exports.color = function(_) {
                if (!arguments.length) { return color; }
                color = _;
                return exports;
            };

            return exports;
        }),
    TemperatureBarGroup = D3EmberComputed(
        'data.[]',
        function() {
            var duration, yScale, xSubScale, color,
                staticDataLabels,
                bars = BarGroup('main');

            function exports(selection) {
                // Update the temperatures
                var temperatures = selection.selectAll(".temperature")
                        .data(function(d) { return d.get('data'); },
                              function(d) { return d.get('temperature'); });
                temperatures.enter()
                    .append("g").attr("class", "temperature")
                    .attr("transform", function(d) {
                        return "translate(" + xSubScale(d.get('temperature')) + ",0)";
                    });
                temperatures
                    .transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + xSubScale(d.get('temperature')) + ",0)";
                    });

                temperatures.call(bars);

                temperatures.exit()
                    .remove();

                // Static data labels
                if (staticDataLabels) {
                    var dataLabels = temperatures.selectAll(".dataLabel")
                            .data(function(d) {
                                return [{temperature: d.get('temperature'),
                                         label: Enums.temperature.options[d.get('temperature')].label,
                                         max: Math.max(d.get('requirement'),
                                                       d.get('capacity')),
                                         width: xSubScale.rangeBand()}]; });
                    var dataLabelsEnter = dataLabels.enter()
                            .append("g")
                            .attr("class", "dataLabel")
                            .attr("transform",
                                  function(d) { return "translate(" + d.width/2 + "," +
                                         (yScale(0) - 30) + ")"; });

                    dataLabelsEnter.append("text")
                        .attr("class", "static_label")
                        .attr("text-anchor", "middle");

                    // dataLabelsEnter.append("text")
                    //     .attr("class", "value")
                    //     .attr("text-anchor", "middle")
                    //     .attr("transform", "translate(0,20)")
                    //     .style("font-weight", "bold")
                    //     .style("fill", '#1f77b4');

                    dataLabels
                        .transition()
                        .duration(duration)
                        .attr("transform",
                              function(d) { return "translate(" + d.width/2 + "," +
                                     (yScale(d.max) - 20) + ")"; });

                    dataLabels
                        .select(".static_label")
                        .text(function(d) {return d.label;});
                    // dataLabels
                    //     .select(".value")
                    //     .text(function(d) {return d3.format(".2f")(d.);});

                    dataLabels.exit()
                        .transition()
                        .duration(duration)
                        .style("opacity", 0)
                        .remove();
                }

            }

            exports.duration = function(_) {
                if (!arguments.length) { return duration; }
                duration = _;
                bars.duration(_);
                return exports;
            };

            exports.yScale = function(_) {
                if (!arguments.length) { return yScale; }
                yScale = _;
                bars.yScale(_);
                return exports;
            };

            exports.xSubScale = function(_) {
                if (!arguments.length) { return xSubScale; }
                xSubScale = _;
                bars.xSubScale(_);
                return exports;
            };

            exports.staticDataLabels = function(_) {
                if (!arguments.length) { return staticDataLabels; }
                staticDataLabels = _;
                return exports;
            };

            exports.color = function(_) {
                if (!arguments.length) { return color; }
                color = _;
                bars.color(_);
                return exports;
            };

            return exports;
        });

export default D3EmberComputed(
    'data.[]',
    function() {
        var xScale, yScale, duration,
            temperatures = TemperatureBarGroup('main');

        function exports(selection) {
            selection.each(function() {
                var g = d3.select(this);

                // Update the facilities
                var facilities = g.selectAll(".category")
                        .data(function(d) {return d.data; },
                              function(d) {return d.get('id');});
                facilities.enter()
                    .append("g").attr("class", "category")
                    .attr("transform", function(d) {
                        return "translate(" +
                            xScale(d.get('name'))
                            + ",0)";
                    });
                facilities
                    .order()
                    .transition().duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" +
                            xScale(d.get('name'))
                            + ",0)";
                    });

                facilities.call(temperatures);

                facilities.exit()
                    .remove();
            });
        }

        exports.xScale = function(_) {
            if (!arguments.length) { return xScale; }
            xScale = _;
            return exports;
        };

        exports.yScale = function(_) {
            if (!arguments.length) { return yScale; }
            yScale = _;
            temperatures.yScale(_);
            return exports;
        };

        exports.xSubScale = function(_) {
            if (!arguments.length) { return temperatures.xSubScale(); }
            temperatures.xSubScale(_);
            return exports;
        };

        exports.duration = function(_) {
            if (!arguments.length) { return duration; }
            duration = _;
            temperatures.duration(_);
            return exports;
        };

        exports.staticDataLabels = function(_) {
            if (!arguments.length) { return temperatures.staticDataLabels(); }
            temperatures.staticDataLabels(_);
            return exports;
        };

        exports.color = function(_) {
            if (!arguments.length) { return temperatures.color(); }
            temperatures.color(_);
            return exports;
        };

        return exports;
    });
