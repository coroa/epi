import d3_empty from './d3-empty';
import d3_scale_weighted_ordinal from './d3-scale-weighted-ordinal';

export default function BarChart() {

    var margin           = {top: 50, right: 40, bottom: 30, left: 40},
        empty            = d3_empty('main'),
        xScale           = d3_scale_weighted_ordinal(),
        yScale           = d3.scale.linear(),
        xAxis            = d3.svg.axis().scale(xScale).innerTickSize(0).tickPadding(15).orient("bottom"),
        yAxis            = d3.svg.axis().scale(yScale).ticks(5).orient("left"),
        color            = d3.scale.category10(),
        duration         = 500,
        oneColor         = false,
        manyColors       = false,
        rotateAxisLabels = false,
        hideAxisLabels   = false,
        hideDataLabels   = false,
        staticDataLabels = false,
        hoverDataLabels  = 'top',
        fadeOnHover      = false,
        noTicks          = false,
        emptyText        = 'No data.',
        xSubScales       = {};

    function chart(selection) {
        selection.each(function(data)
        {
            var width = selection[0][0].offsetWidth-margin.left-margin.right;
            var height = selection[0][0].offsetHeight-margin.top-margin.bottom;

            if (noTicks) {
                xAxis.tickFormat("");
            }

            empty.width(width).height(height);
            if (empty(d3.select(this))) {
                return;
            }

            // Update the x-scale.
            xScale.domain(data.values.map(function(d) { return d.label || d.key; }));

            xScale.rangeRoundBands(
                [0, width],
                data.values.map(function(d) { return d.values.length; }));

            // Calculate subscales
            var newXSubScales = {};
            data.values.forEach(function(d) {
                newXSubScales[d.key] = (xSubScales[d.key] ||
                                        d3.scale.ordinal())
                    .domain(d.values.map(function(d) { return d.key; }))
                    .rangeRoundBands(
                        [0, xScale.weightedRangeBand(d.label || d.key)], 0.1);
            });
            xSubScales = newXSubScales;

            // Update the y-scale.
            yScale
                .range([height, 0])
                .domain([0, data.maxValue]);

            // Select the svg element, if it exists.
            var svg = selection.selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg").append("g");
            gEnter.append("g").attr("class", "x axis").call(xAxis);
            gEnter.append("g").attr("class", "y axis").call(yAxis);

            // Update the outer dimensions.
            svg.attr("width", width + margin.left + margin.right)
               .attr("height", height + margin.top + margin.bottom);

            // Update the inner dimensions.
            var g = svg.select("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Update the x-axis.
            g.select(".x.axis")
                .attr("transform", "translate(0, "+yScale(0)+")") // transform to 0 baseline (in case of neg values)
                .transition()
                .duration(duration)
                .call(xAxis);

            if (rotateAxisLabels) {
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

            // Update the categories
            var cats = g.selectAll(".category")
                .data(function(d) { return d.values; },
                      function(d) { return d.key; });
            cats.enter()
                .append("g").attr("class", "category")
                .attr("transform", function(d) {
                    return "translate(" +
                        (xScale(d.label || d.key) -
                         xScale.weightedRangeBand(d.label || d.key)/2)
                        + ",0)";
                });
            cats.transition().duration(duration)
                .attr("transform", function(d) {
                    return "translate(" +
                        (xScale(d.label || d.key) -
                         xScale.weightedRangeBand(d.label || d.key)/2)
                        + ",0)";
                });

            // Update the stacks
            var stacks = cats.selectAll(".stack")
                    .data(function(d,i) {
                        return d.values.map(function(e) {
                            e.xScale = xSubScales[d.key];
                            return e;
                        });
                    }, function(d) { return d.key; });
            stacks.enter()
                .append("g").attr("class", "stack")
                .attr("transform", function(d) {
                    return "translate(" + d.xScale(d.key) + ",0)";
                });
            stacks
                .transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.xScale(d.key) + ",0)";
                });

            var bars = stacks.selectAll(".bar")
                    .data(function(d) {
                        var y0 = 0,
                            width = d.xScale.rangeBand();

                        return d.values.map(function(e) {
                            e.colour = d.colour || color(d.key);
                            e.width = width;
                            e.y0 = y0;
                            e.y1 = (y0 += e.value);
                            return e;
                        });
                    }, function(d) { return d.key; });
            bars.enter()
                .append("rect")
                .attr("class", "bar")
                .attr("stroke", "black")
                .attr("height", 0)
                .attr("width", function(d) {return d.width;})
                .attr("y", yScale(0));
            bars // update
                .attr("stroke-width", function(d) {return d.isAffected ? 2:0;})
                .attr("fill", function(d, i) {
                    var col;
                    if (d.colour) {
                        col = d.colour;
                    } else if (manyColors) {
                        col = color(d.key);
                    } else {
                        col = oneColor;
                    }
                    return d3.rgb(col).brighter(0.5*i);
                })
                .sort(function(a, b) {
                    return a.isAffected ? +1 :
                        (b.isAffected ? -1 : 0);
                })
                .transition()
                .duration(duration)
                .attr("width", function(d) {return d.width;})
                .attr("y", function(d) { return yScale(d.y1); })
                .attr("height", function(d) { return yScale(d.y0) -
                                       yScale(d.y1);});

            bars.exit()
                .transition()
                .duration(duration)
                .attr("y", yScale(0))
                .attr("height", 0)
                .remove();

            stacks.exit()
                .remove();

            cats.exit()
                .remove();

            // Static data labels
            if (staticDataLabels) {
                var dataLabels = stacks.selectAll(".dataLabel")
                        .data(function(d, i) {
                            return [{key: d.key, label: d.label, total: d.total,
                                     width: d.xScale.rangeBand()}]; });
                var dataLabelsEnter = dataLabels.enter()
                        .append("g")
                        .attr("class", "dataLabel")
                        .attr("transform",
                              function(d) { return "translate(" + d.width/2 + "," +
                                     (yScale(0) - 30) + ")"; });

                dataLabelsEnter.append("text")
                    .attr("class", "static_label")
                    .attr("text-anchor", "middle");

                dataLabelsEnter.append("text")
                    .attr("class", "value")
                    .attr("text-anchor", "middle")
                    .attr("transform", "translate(0,20)")
                    .style("font-weight", "bold")
                    .style("fill", '#1f77b4');

                dataLabels
                    .transition()
                    .duration(duration)
                    .attr("transform",
                          function(d) { return "translate(" + d.width/2 + "," +
                                 (yScale(d.total) - 30) + ")"; });

                dataLabels
                    .select(".static_label")
                    .text(function(d) {return d.label || d.key;});
                dataLabels
                    .select(".value")
                    .text(function(d) {return d3.format(".2f")(d.total);});

                dataLabels.exit()
                    .transition()
                    .duration(duration)
                    .style("opacity", 0)
                    .remove();
            }

            // Hover labels
            if (hoverDataLabels && !hideDataLabels ) {

                // Select the container, if it exists.
                var hoverLabel = selection.selectAll(".hover-label").data([data]);

                // Otherwise, create the container
                var hoverLabelEnter = hoverLabel.enter().append("div").attr("class", "hover-label top");
                hoverLabelEnter.append("div").attr("class", "arrow");
                hoverLabelEnter.append("div").attr("class", "hover-label-content");

                hoverLabel.style('display', 'none');
                bars
                    .on("mouseover.labels", function(d) {
                        hoverLabel.style("display", "initial");
                        hoverLabel.select(".hover-label-content")
                            .html("<p>" + (d.label || d.key) + " : <strong>" +
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

            if (fadeOnHover) {
                selection.selectAll(".bar")
                    .on("mouseout.fade", function() {
                        selection.selectAll(".bar")
                            // .transition()
                            // .duration(200)
                            .style("opacity", "1");
                    })
                    .on("mouseover.fade", function(d, i) {
                        selection.selectAll(".bar").filter(function(d, j){return i!==j;})
                            // .transition()
                            // .duration(200)
                            .style("opacity", ".7");
                        selection.selectAll(".bar").filter(function(d, j){return i===j;})
                            // .transition()
                            // .duration(200)
                            .style("opacity", "1");
                    });
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

    chart.oneColor = function(_) {
        if (!arguments.length) { return oneColor; }
        oneColor = _;
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
        if (!arguments.length) { return emptyText; }
        emptyText = _;
        return chart;
    };

    chart.fadeOnHover = function(_) {
        if (!arguments.length) { return fadeOnHover; }
        fadeOnHover = _;
        return chart;
    };

    chart.manyColors = function(_) {
        if (!arguments.length) { return manyColors; }
        manyColors = _;
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

    return chart;
}
