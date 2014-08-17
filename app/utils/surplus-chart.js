import Ember from 'ember';
import Enums from '../enums';
import d3_empty from './d3-empty';

/* global d3 */

export default function SurplusChart() {

    var margin           = {top: 50, right: 40, bottom: 50, left: 40},
        empty            = d3_empty('main'),
        xScale           = d3.scale.ordinal(),
        yScale           = d3.scale.linear(),
        xAxis            = d3.svg.axis().scale(xScale).innerTickSize(0).tickPadding(15).orient("bottom"),
        yAxis            = d3.svg.axis().scale(yScale).ticks(5).orient("left"),
        color            = d3.scale.category10(),
        duration         = 500,
        rotateAxisLabels = false,
        hideAxisLabels   = false,
        hideDataLabels   = false,
        staticDataLabels = false,
        hoverDataLabels  = 'top',
        fadeOnHover      = true,
        noTicks          = false,
        threshold        = 5,
        xSubScale        = d3.scale.ordinal(),
        highlightedFacility = null,
        emberComponent = null;

    function chart(selection) {
        selection.each(function(data)
        {
            var myRotateAxisLabels = rotateAxisLabels
                    || data.data.get('length') > threshold,
                myStaticDataLabels = staticDataLabels
                    && data.data.get('length') <= threshold,
                myMargin = margin;

            if (myRotateAxisLabels) {
                myMargin = Ember.$.extend({}, margin,
                                          { bottom: Math.max(margin.bottom, 80) });
            }

            var sel = d3.select(this),
                width = selection[0][0].offsetWidth-myMargin.left-myMargin.right,
                height = selection[0][0].offsetHeight-myMargin.top-myMargin.bottom;

            if (noTicks) {
                xAxis.tickFormat("");
            }

            empty.width(width).height(height);
            if (empty(sel)) {
                return;
            }

            // Update the x-scale.
            var facs = data.data.toArray();
            facs.sort(function(a,b) { return (b.get('totalDifference') -
                                  a.get('totalDifference')); });
            xScale
                .domain(facs.mapBy('name'))
                .rangeRoundBands([0, width], 0.1);

            xSubScale
                .domain(data.data.objectAt(0).get('data').mapBy('temperature'))
                .rangeRoundBands([0, xScale.rangeBand()], 0.1);

            // Update the y-scale.
            yScale
                .range([height, 0])
                .domain([0, data.maxValue]);

            // Select the svg element, if it exists.
            var svg = sel.selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg").append("g");
            gEnter.append("g").attr("class", "x axis").call(xAxis);
            gEnter.append("g").attr("class", "y axis").call(yAxis);

            // Update the outer dimensions.
            svg.attr("width", width + myMargin.left + myMargin.right)
               .attr("height", height + myMargin.top + myMargin.bottom);

            // Update the inner dimensions.
            var g = svg.select("g")
                    .attr("transform", "translate(" + myMargin.left + "," + myMargin.top + ")");

            // Update the x-axis.
            g.select(".x.axis")
                .attr("transform", "translate(0, "+yScale(0)+")") // transform to 0 baseline (in case of neg values)
                .transition()
                .duration(duration)
                .call(xAxis);

            if (myRotateAxisLabels) {
                svg.selectAll(".x.axis text")
                    .attr("transform", "rotate(-45)translate(-9, -7)")
                    .style("text-anchor", "end");
            }

            if (hideAxisLabels) {
                svg.selectAll(".x.axis text")
                    .style("opacity", "0");
            }

            // Update the y-axis.
            g.select(".y.axis").transition().duration(duration).call(yAxis);

            // Update the facilities
            var facilities = g.selectAll(".category")
                    .data(function(d) {return d.data;},
                          function(d) {return d.get('id');});
            facilities.enter()
                .append("g").attr("class", "category")
                .attr("transform", function(d) {
                    return "translate(" +
                        xScale(d.get('name'))
                        + ",0)";
                });;
            facilities
                .transition().duration(duration)
                .attr("transform", function(d) {
                    return "translate(" +
                        xScale(d.get('name'))
                        + ",0)";
                });

            // Update the temperatures
            var temperatures = facilities.selectAll(".temperature")
                    .data(function(d) {return d.get('data');},
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

            var bars = temperatures.selectAll(".bar")
                    .data(function(d) {
                        var width = xSubScale.rangeBand()/3,
                            requirement = d.get('requirement') || 0,
                            capacity = d.get('capacity') || 0,
                            difference = d.get('difference'),
                            isHighlighted = d.get('facility.id') === highlightedFacility,
                            base = d.getProperties('facility',
                                                   'temperature');
                        return [ { label: "Required", value: requirement },
                                 { label: "Actual", value: capacity },
                                 { label: (difference > 0
                                           ? "Missing" : "Surplus"),
                                   value: difference } ]
                            .map(function(obj, i) {
                                return Ember.$.extend(obj, base, {
                                    x: i*width, width: width,
                                    isHighlighted: isHighlighted
                                });
                            });
                    });
            bars.enter()
                .append("rect")
                .attr("class", "bar")
                .attr("stroke", "black")
                .attr("height", 0)
                .attr("width", function(d) {return d.width;})
                .attr("x", function(d) {return d.x; })
                .attr("y", yScale(0));
            bars // update
                .attr("stroke-width", function(d) {return d.isHighlighted ? 2:0;})
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


            temperatures.exit()
                .remove();

            facilities.exit()
                .remove();

            facilities.on('click', function(facility) {
                emberComponent.send('clickFacility', facility);
            });

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

            // Hover labels
            if (hoverDataLabels) {

                // Select the container, if it exists.
                var hoverLabel = sel.selectAll(".hover-label").data([data]);

                // Otherwise, create the container
                var hoverLabelEnter = hoverLabel.enter().append("div").attr("class", "hover-label top");
                hoverLabelEnter.append("div").attr("class", "arrow");
                hoverLabelEnter.append("div").attr("class", "hover-label-content");

                hoverLabel.style('display', 'none');
                bars
                    .on("mouseover.labels", function(d) {
                        hoverLabel.style("display", "initial");
                        hoverLabel.select(".hover-label-content")
                            .html("<p><strong>" + d.label + "</strong> capacity<br/>of "
                                  + d.facility.get('name') + " @ " +
                                  Enums.temperature.options[d.temperature].label
                                  + " :<br/> <strong>" +
                                  d3.format(".2f")(d.value) + "</strong></p>");

                        var $hoverLabel = hoverLabel[0][0],
                            $object = d3.select(this)[0][0],
                            pos = $object.getBoundingClientRect(),
                            top = pos.top - $hoverLabel.offsetHeight - 6,
                            left = pos.left - ($hoverLabel.offsetWidth / 2) + (pos.width / 2);


                        hoverLabel.style("left", left+"px");
                        hoverLabel.style("top", top+"px");
                    })
                    .on("mouseout.labels", function() { hoverLabel.style("display", "none"); });
            }

        });
    }

    chart.margin = function(_) {
        if (!arguments.length) { return margin; }
        margin = _;
        return chart;
    };

    chart.margin.bottom = function(_) {
        if (!arguments.length) { return margin.bottom; }
        margin.bottom = _;
        return chart;
    };

    chart.xAxisTickValues = function(_) {
        if (!arguments.length) { return xAxis.tickValues(); }
        xAxis.tickValues(_);
        return chart;
    };

    chart.rotateAxisLabels = function(_) {
        if (!arguments.length) { return rotateAxisLabels; }
        rotateAxisLabels = _;
        return chart;
    };

    chart.hideAxisLabels = function(_) {
        if (!arguments.length) { return hideAxisLabels; }
        hideAxisLabels = _;
        return chart;
    };

    chart.hideDataLabels = function(_) {
        if (!arguments.length) { return hideDataLabels; }
        hideDataLabels = _;
        return chart;
    };

    chart.hoverDataLabels = function(_) {
        if (!arguments.length) { return hoverDataLabels; }
        hoverDataLabels = _;
        return chart;
    };

    chart.staticDataLabels = function(_) {
        if (!arguments.length) { return staticDataLabels; }
        staticDataLabels = _;
        return chart;
    };

    chart.duration = function(_) {
        if (!arguments.length) { return duration; }
        duration = _;
        return chart;
    };

    chart.emptyText = function(_) {
        if (!arguments.length) { return empty.emptyText(); }
        empty.emptyText(_);
        return chart;
    };

    chart.fadeOnHover = function(_) {
        if (!arguments.length) { return fadeOnHover; }
        fadeOnHover = _;
        return chart;
    };

    chart.colors = function(_) {
        if (!arguments.length) { return color.range(); }
        color.range(_);
        return chart;
    };

    chart.noTicks = function(_) {
        if (!arguments.length) {
            if ( xAxis.tickSize() === 0 ) {
                return true;
            } else {
                return false;
            }
        }

        if (_ === true) {
            xAxis.tickSize(0);
        } else {
            xAxis.tickSize(1);
        }
        return chart;
    };

    chart.highlightedFacility = function(_) {
        if (!arguments.length) { return highlightedFacility; }
        highlightedFacility = _;
        return chart;
    };

    chart.emberComponent = function(_) {
        if (!arguments.length) { return emberComponent; }
        emberComponent = _;
        return chart;
    };

    return chart;
}
