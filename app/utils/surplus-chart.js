import Ember from 'ember';
import d3_empty from './d3-empty';
import d3_facilities_bar_groups from './d3-facilities-bar-groups';


export default function SurplusChart() {

    var margin           = {top: 50, right: 40, bottom: 30, left: 40},
        empty            = d3_empty('main'),
        facilities       = d3_facilities_bar_groups('main'),
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
        threshold        = 10,
        xSubScale        = d3.scale.ordinal();

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
            xScale
                .domain(data.data.mapBy('name'))
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

            // Main Plot
            facilities
                .xScale(xScale).yScale(yScale).xSubScale(xSubScale)
                .duration(duration).color(color)
                .staticDataLabels(myStaticDataLabels);
            g.call(facilities);

            // Hover labels
            if (hoverDataLabels) {

                // Select the container, if it exists.
                var hoverLabel = sel.selectAll(".hover-label").data([data]);

                // Otherwise, create the container
                var hoverLabelEnter = hoverLabel.enter().append("div").attr("class", "hover-label top");
                hoverLabelEnter.append("div").attr("class", "arrow");
                hoverLabelEnter.append("div").attr("class", "hover-label-content");

                hoverLabel.style('display', 'none');
                sel.selectAll(".bar")
                    .on("mouseover.labels", function(d) {
                        hoverLabel.style("display", "initial");
                        hoverLabel.select(".hover-label-content")
                            .html("<p>" + d.label + " : <strong>" +
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

            // if (fadeOnHover) {
            //     selection.selectAll(".bar")
            //         .on("mouseout.fade", function() {
            //             selection.selectAll(".bar")
            //                 // .transition()
            //                 // .duration(200)
            //                 .style("opacity", "1");
            //         })
            //         .on("mouseover.fade", function(d, i) {
            //             selection.selectAll(".bar").filter(function(d, j){return i!==j;})
            //                 // .transition()
            //                 // .duration(200)
            //                 .style("opacity", ".7");
            //             selection.selectAll(".bar").filter(function(d, j){return i===j;})
            //                 // .transition()
            //                 // .duration(200)
            //                 .style("opacity", "1");
            //         });
            // }
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

    return chart;
}
