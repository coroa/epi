export default function BarChart() {

    var margin           = {top: 40, right: 20, bottom: 40, left: 60},
        xScale           = d3.scale.ordinal(),
        yScale           = d3.scale.linear(),
        xAxis            = d3.svg.axis().scale(xScale).orient("bottom"),
        yAxis            = d3.svg.axis().scale(yScale).orient("left"),
        color            = d3.scale.category10(),
        duration         = 500,
        oneColor         = false,
        manyColors       = false,
        rotateAxisLabels = false,
        hideAxisLabels   = false,
        hideDataLabels   = false,
        staticDataLabels = false,
        hoverDataLabels  = 'top',
        fadeOnHover      = true,
        noTicks          = false,
        emptyText        = 'No data.';


    function chart(selection) {
        selection.each(function(data)
        {
            var width = selection[0][0].offsetWidth-margin.left-margin.right;
            var height = selection[0][0].offsetHeight-margin.top-margin.bottom;

            if (noTicks) {
                xAxis.tickFormat("");
            }

            // Calculate the stacks and a total
            data.forEach(function(d) {
                var y0 = +0;
                if (d.sublabels === undefined) { d.sublabels = []; }
                d.stacks = d.values.map(function(x, i) {
                    var value = isNaN(+x) ? 0 : +x;
                    return { label: d.sublabels[i],
                             value: x,
                             id: d.id,
                             y0: y0,
                             y1: y0 += +value };
                });
                d.total = d.stacks[d.stacks.length - 1].y1;
            });

            var empty = !data.some(function(d) {
                return (d.total !== 0);
            });

            if (empty) {
                // Select the message svg element, if it exists.

                var setMsg = function() {
                    var msg = selection.selectAll(".message").data([data]);
                    msg.enter()
                        .append("div")
                        .style('padding-top', (height/2)+'px')
                        .style('text-align', 'center')
                        .attr('class', 'message')
                        .append('text');
                    msg.select('text')
                        .attr("transform", function() {return 'translate('+width/2+', '+height/2+')';})
                        .transition()
                        .duration(100)
                        .text(function() {return emptyText || 'No data to show.'; });
                };

                if (selection.select("path")[0][0]) {
                    selection
                        .selectAll("svg")
                        .transition()
                        .duration(200)
                        .style('opacity', 0)
                        .each('end', function(d) {
                          setMsg();
                        })
                        .remove();
                } else {
                    setMsg();
                }
                return;

            } else {
                selection
                    .select('.message')
                    .remove();
            }

            // Update the x-scale.
            xScale
                .rangeRoundBands([0, width], 0.1)
                .domain(data.map(function(d) { return d.id; }));

            // Update the y-scale.
            yScale
                .range([height, 0])
                .domain([0, d3.max(data, function(d) { return d.total; })]);

            // Select the svg element, if it exists.
            var svg = selection.selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg").append("g");
            gEnter.append("g")
                .attr("class", "x axis")
                .call(xAxis);
            gEnter.append("g").attr("class", "y axis").call(yAxis);

            // Update the outer dimensions.
            svg .attr("width", width + margin.left + margin.right)
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
            g.select(".y.axis")
                .transition()
                .duration(duration)
                .call(yAxis);

            // Update the stacks
            var stacks = g.selectAll(".stack").data(function(d) { return d; });
            stacks.enter()
                .append("g").attr("class", "stack")
                .attr("transform", function(d) {
                    return "translate(" +
                        xScale(d.id) + ",0)";
                });
            stacks
                .transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" +
                        xScale(d.id) + ",0)";
                });

            var bars = stacks.selectAll(".bar")
                    .data(function(d) {return d.stacks;});
            bars.enter()
                .append("rect")
                .attr("class", "bar")
                .attr("height", 0)
                .attr("width", xScale.rangeBand())
                .attr("y", yScale(0));
            bars // update
                .attr("fill", function(d, i) {
                    var col = oneColor;
                    if (manyColors) {
                        col = color(d.id);
                    }
                    return d3.rgb(col).brighter(i);
                })
                .transition()
                .duration(duration)
                .attr("width", xScale.rangeBand())
                .attr("y", function(d) { return yScale(d.y1); })
                .attr("height", function(d) {return yScale(d.y0) - yScale(d.y1);});
            bars.exit()
                .transition()
                .duration(duration)
                .attr("y", height)
                .attr("height", 0)
                .remove();

            stacks.exit()
                .remove();

            // Static data labels
            if (staticDataLabels) {
                gEnter.append("g").attr("class", "dataLabels");
                var dataLabels = g.select(".dataLabels")
                        .selectAll(".dataLabel")
                        .data(function(d) {return d;});

                var dataLabelsEnter = dataLabels.enter()
                    .append("g")
                    .attr("class", "dataLabel")
                    .attr("transform", function(d, i) { return "translate("+ (xScale(d.id) + (xScale.rangeBand() / 2)) +","+(yScale(0) - 30)+")"; });

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
                    .attr("transform", function(d, i) {return "translate("+ (xScale(d.id) + (xScale.rangeBand() / 2)) +","+(yScale(d.total) - 30)+")"; });
                dataLabels
                    .select(".static_label")
                    .text(function(d) {return d.label;});
                dataLabels
                    .select(".value")
                    .text(function(d) {return d3.format(".2s")(d.total);});
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
                    .on("mouseover.labels", function() { hoverLabel.style("display", "initial"); })
                    .on("mouseout.labels", function() { hoverLabel.style("display", "none"); })
                    .on("mousemove.labels", function(d, i) {
                        hoverLabel.select(".hover-label-content")
                            .html("<p>" + d.label + " : <strong>" + d.value + "</strong></p>");

                        var $hoverLabel = hoverLabel[0][0],
                            $object = d3.select(this)[0][0],
                            pos = $object.getBoundingClientRect(),
                            top = pos.top - $hoverLabel.offsetHeight - 6,
                            left = pos.left - ($hoverLabel.offsetWidth / 2) + (pos.width / 2);


                        hoverLabel.style("left", left+"px");
                        hoverLabel.style("top", top+"px");

                    });
            }

            if (fadeOnHover) {
                selection.selectAll(".bar")
                    .on("mouseout.fade", function() {
                        selection.selectAll(".bar").style("opacity", "1");
                    })
                    .on("mouseover.fade", function(d, i) {
                        selection.selectAll(".bar").filter(function(d, j){return i!==j;})
                            .style("opacity", ".5");
                        selection.selectAll(".bar").filter(function(d, j){return i===j;})
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
