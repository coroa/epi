var scale_weighted_ordinal = function() {
  return d3_scale_weighted_ordinal([], {t: "range", a: [[]]});
};

function d3_scale_weighted_ordinal(domain, ranger) {
  var index,
      range,
      rangeBand;

  function scale(x) {
    var ret = range[((index.get(x) || (ranger.t === "range" ?
                                       index.set(x, domain.push(x)) :
                                       NaN)) - 1) % range.length];
    // never return undefined, as xAxis doesn't work otherwise
    if (ret === undefined) { return 0; }
    return ret;
  }

  function steps(start, step, weights) {
      var accum = start;
      return d3.range(weights.length || domain.length).map(function(i) {
          var val = accum + step * (weights[i] || 1) / 2;
          accum += step * (weights[i] || 1);
          return val;
      });
  }

  scale.domain = function(x) {
    if (!arguments.length) { return domain; }
    domain = [];
    index = d3.map();
    var i = -1, n = x.length, xi;
    while (++i < n) {
        if (!index.has(xi = x[i])) {
           index.set(xi, domain.push(xi));
        }
    }
    return scale[ranger.t].apply(scale, ranger.a);
  };

  scale.range = function(x) {
    if (!arguments.length) { return range; }
    range = x;
    rangeBand = 0;
    ranger = {t: "range", a: arguments};
    return scale;
  };

  scale.rangeRoundBands = function(x, weights, padding, outerPadding) {
    if (arguments.length < 2) { weights = []; }
    if (arguments.length < 3) { padding = 0; }
    if (arguments.length < 4) { outerPadding = padding; }
    var length = d3.sum(weights) || domain.length,
        reverse = x[1] < x[0],
        start = x[reverse - 0],
        stop = x[1 - reverse],
        step = Math.floor((stop - start) / (length - padding + 2 * outerPadding)),
        error = stop - start - (length - padding) * step;
    range = steps(start + Math.round(error / 2), step, weights);
    if (reverse) { range.reverse(); }
    rangeBand = weights.map(function(w) {
        return Math.round(w * step * (1 - padding));
    });
    ranger = {t: "rangeRoundBands", a: arguments};
    return scale;
  };

  scale.weightedRangeBand = function(x) {
    return rangeBand[(index.get(x) - 1) % rangeBand.length];
  };

  scale.rangeExtent = function() {
      var domain = ranger.a[0],
          start = domain[0], stop = domain[domain.length - 1];
      return start < stop ? [start, stop] : [stop, start];
  };

  scale.copy = function() {
    return d3_scale_weighted_ordinal(domain, ranger);
  };

  return scale.domain(domain);
}

export default function BarChart() {

    var margin           = {top: 40, right: 40, bottom: 30, left: 40},
        xScale           = d3.scale.ordinal(),
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
        fadeOnHover      = true,
        noTicks          = false,
        emptyText        = 'No data.',
        categories       = false;


    function chart(selection) {
        selection.each(function(data)
        {
            var width = selection[0][0].offsetWidth-margin.left-margin.right;
            var height = selection[0][0].offsetHeight-margin.top-margin.bottom;

            if (noTicks) {
                xAxis.tickFormat("");
            }

            var empty = (data.maxValue === undefined ||
                         data.maxValue === 0);

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
                        .each('end', function() {
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
            xScale.domain(data.values.map(function(d) { return d.key; }));

            var xSubScales;
            if (categories) {
                xScale.rangeRoundBands(
                    [0, width],
                    data.values.map(function(d) { return d.values.length; }));

                // Calculate subscales
                xSubScales = data.values.map(function(d) {
                    return d3.scale.ordinal()
                        .domain(d.values.map(function(d) { return d.key; }))
                        .rangeRoundBands(
                            [0, xScale.weightedRangeBand(d.key)], 0.1);
                });
            } else {
                xScale.rangeRoundBands([0, width], 0.1);
                xSubScales = [ xScale ];
            }

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

            var cats;
            if (categories) {
                // Update the categories
                cats = g.selectAll(".category")
                        .data(function(d) { return d.values; });
                cats.enter()
                    .append("g").attr("class", "category")
                    .attr("transform", function(d) {
                        return "translate(" + (xScale(d.key) - xScale.weightedRangeBand(d.key)/2) + ",0)";
                });
                cats.transition().duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + (xScale(d.key) - xScale.weightedRangeBand(d.key)/2) + ",0)";
                    });
            } else {
                cats = g;
            }

            // Update the stacks
            var stacks = cats.selectAll(".stack")
                    .data(function(d,i) {
                        return d.values.map(function(e) {
                            e.parent = i;
                            return e;
                        });
                    });
            stacks.enter()
                .append("g").attr("class", "stack")
                .attr("transform", function(d) {
                    return "translate(" + xSubScales[d.parent](d.key) + ",0)";
                });
            stacks
                .transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + xSubScales[d.parent](d.key) + ",0)";
                });

            var bars = stacks.selectAll(".bar")
                    .data(function(d) {
                        var y0 = 0,
                            width = xSubScales[d.parent].rangeBand();

                        return d.values.map(function(e) {
                            e.colour = d.colour || color(d.key);
                            e.width = width;
                            e.y0 = y0;
                            e.y1 = (y0 += e.value);
                            return e;
                        });
                    });
            bars.enter()
                .append("rect")
                .attr("class", "bar")
                .attr("height", 0)
                .attr("width", function(d) {return d.width;})
                .attr("y", yScale(0));
            bars // update
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
                .transition()
                .duration(duration)
                .attr("width", function(d) {return d.width;})
                .attr("y", function(d) { return yScale(d.y1); })
                .attr("height", function(d) { return yScale(d.y0) - yScale(d.y1);});
            bars.exit()
                .transition()
                .duration(duration)
                .attr("y", height)
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
                            return [{key: d.key,
                                total: d.total,
                                width: xSubScales[d.parent].rangeBand()}]; });
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
                    .text(function(d) {return d.key;});
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
                    .on("mouseover.labels", function() { hoverLabel.style("display", "initial"); })
                    .on("mouseout.labels", function() { hoverLabel.style("display", "none"); })
                    .on("mousemove.labels", function(d, i) {
                        hoverLabel.select(".hover-label-content")
                            .html("<p>" + d.key + " : <strong>" + d3.format(".2f")(d.value) + "</strong></p>");

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
                        selection.selectAll(".bar")
                            .transition()
                            .duration(200)
                            .style("opacity", "1");
                    })
                    .on("mouseover.fade", function(d, i) {
                        selection.selectAll(".bar").filter(function(d, j){return i!==j;})
                            .transition()
                            .duration(200)
                            .style("opacity", ".7");
                        selection.selectAll(".bar").filter(function(d, j){return i===j;})
                            .transition()
                            .duration(200)
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

    chart.categories = function(_) {
        if (!arguments.length) { return categories; }
        categories = _;
        if (categories === true) {
            xScale = scale_weighted_ordinal();
        } else {
            xScale = d3.scale.ordinal();
        }
        xAxis.scale(xScale);
        return chart;
    };

    return chart;
}
