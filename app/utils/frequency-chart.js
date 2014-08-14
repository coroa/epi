import d3_empty from './d3-empty';

/* global d3 */

export default function FrequencyChart() {
    var margin           = {top: 50, right: 40, bottom: 30, left: 40},
        empty            = d3_empty('main'),
        xScale           = d3.scale.linear(),
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
        emptyText        = 'No data.';

    function chart(selection) {
        selection.each(function(data)
        {
            var width = selection[0][0].offsetWidth-margin.left-margin.right;
            var height = selection[0][0].offsetHeight-margin.top-margin.bottom;

            if (noTicks) {
                xAxis.tickFormat("");
            }

            var accessor = function(v) { return v.difference; };

            data.maxValue = d3.max(data,accessor);
            empty.width(width).height(height);
            if (empty(d3.select(this))) {
                return;
            }

            // Update the x-scale.
            xScale
                .domain([d3.min(data,accessor),
                         data.maxValue])
                .nice(20)
                .range([0, width]);

            // Generate the histogram
            var bins = d3.layout.histogram()
                    .bins(xScale.ticks(20))
                    .value(accessor)(data);

            // Update the y-scale.
            yScale
                .domain([0, d3.max(bins, function(d) { return d.y; })])
                .range([height, 0]);


            // Select the svg element, if it exists.
            var svg = selection.selectAll("svg").data([bins]);

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

            var barWidth = xScale(bins[0].dx) - xScale(0);

            // Update the bars
            var bars = g.selectAll(".bar").data(bins),
                barsEnter = bars.enter()
                .append("g")
                .attr("class", "bar")
                .attr("transform", function(d) {
                    return "translate(" + xScale(d.x) + "," + yScale(0) + ")";
                });

            bars
                .transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")";
                });

            var barsExit = bars.exit();
            barsExit
                .transition()
                .duration(duration)
                .attr("y", yScale(0))
                .attr("height", 0)
                .remove();

            // The rectangle

            barsEnter.append("rect")
                .attr("x", 1)
                .attr("width", barWidth - 1)
                .attr("height", 0)
                .attr("stroke", "black");

            bars.select("rect")
                .attr("fill", color(0))
                // .attr("stroke-width", function(d) {return d.isAffected ? 2:0;})
                .transition()
                .duration(duration)
                .attr("width", barWidth - 1)
                .attr("height", function(d) { return yScale(0) - yScale(d.y);});

            barsExit.select("rect")
                .transition()
                .duration(duration)
                .attr("width", barWidth - 1)
                .attr("height", 0)
                .remove();

            // The text labels

            if (staticDataLabels) {
                var formatCount = d3.format(",.0f");

                barsEnter.append("text")
                    .attr("dy", ".75em")
                    .attr("y", "-15")
                    .attr("x", barWidth / 2)
                    .attr("text-anchor", "middle")
                    .text(function(d) { return formatCount(d.y); });

                bars.select("text")
                    .text(function(d) { return formatCount(d.y); })
                    .transition()
                    .duration(duration)
                    .attr("x", barWidth / 2);

                barsExit.select("text")
                    .transition()
                    .duration(duration)
                    .attr("x", barWidth / 2)
                    .attr("opacity", 0)
                    .remove();
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
