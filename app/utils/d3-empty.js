export default function() {
    var emptyText = 'No data.',
        width, height;

    function exports(selection) {
        var data = selection.data()[0],
            empty = (data.maxValue === undefined ||
                     data.maxValue === 0 ||
                     data.maxValue === -Infinity);

        if (empty) {
            // Select the message svg element, if it exists.

            var setMsg = function() {
                var msg = selection
                        .selectAll(".message").data([data]);
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
            return true;

        } else {
            selection
                .select('.message')
                .remove();
            return false;
        }
    }

    exports.width = function(_) {
        if (!arguments.length) { return width; }
        width = _;
        return exports;
    };

    exports.height = function(_) {
        if (!arguments.length) { return height; }
        height = _;
        return exports;
    };

    exports.emptyText = function(_) {
        if (!arguments.length) { return emptyText; }
        emptyText = _;
        return exports;
    };

    return exports;
}
