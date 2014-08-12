import d3 from 'd3';

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

export default function() {
    return d3_scale_weighted_ordinal([], {t: "range", a: [[]]});
}
