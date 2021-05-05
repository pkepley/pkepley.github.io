var buffon_viz = (function () {

    // ----------- Set up visualization components -----------------------------
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        full_width = 400,
        full_height = 400,
        width  = full_width - margin.left - margin.right,
        height = full_height - margin.top - margin.bottom;

    var x_lo = 0,
        x_hi = width,
        y_lo = 0,
        y_hi = height;

    var svg = d3.select("#simulation_svg")
        .attr("max-width", "400px")
        .attr("width", "100%")
        .attr("height", "400px")
        .attr("max-height", "auto")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    var yScale = d3.scaleLinear()
        .domain([y_lo, y_hi])
        .range([height, 0]);

    var xScale = d3.scaleLinear()
        .domain([x_lo, x_hi])
        .range([0, width]);

    var n_strips = 10;
    var strip_height = (y_hi - y_lo) / n_strips;
    var horizontal_line = [...Array(n_strips + 1).keys()].map(y => y_lo + strip_height * y);

    svg.selectAll(".horizontal-line")
        .remove();

    svg.selectAll(".horizontal-line")
            .data(horizontal_line)
            .enter()
            .append("line")
            .attr("class", "horizontal-line")
            .attr("x1", 0)
            .attr("y1", function(d){console.log(d, yScale(d)); return yScale(d);})
            .attr("x2", width)
            .attr("y2", d => yScale(d));

    // ------------ Simulation core functionality ------------------------------
    function n_needles()  {
        return number_needles_selector.property("value");
    }

    function needle_length(){
        return strip_height * needle_length_selector.property("value");
    }

    function throw_needle() {
        var x_center = x_lo + (x_hi - x_lo) * Math.random();
        var y_center = y_lo + (y_hi - y_lo) * Math.random();
        var theta = Math.PI * Math.random();

        var c_theta = 0.5 * needle_length() * Math.cos(theta);
        var s_theta = 0.5 * needle_length() * Math.sin(theta);

        var x1 = x_center - c_theta;
        var x2 = x_center + c_theta;
        var y1 = y_center - s_theta;
        var y2 = y_center + s_theta;

        var testing =Math.min(y1, y2);
        var ys_lo = Math.min(y1, y2),
            ys_hi = Math.max(y1, y2);
        var line_above = y_lo + strip_height * Math.ceil((ys_lo - y_lo) / strip_height);
        var crosses_line =  line_above < ys_hi;

        return {x1 : x1, x2 : x2, y1 : y1, y2 : y2, crosses_line : crosses_line};
    }

    function needle_simulation() {
        var needles = new Array(n_needles());

        for(var i = 0; i < n_needles(); i++){
            needles[i] = throw_needle();
        }

        return needles;
    }

    function update_needle_display() {
        var needles = needle_simulation();

        svg.selectAll(".needle")
            .remove();

        svg.selectAll(".needle")
            .data(needles)
            .enter()
            .append("line")
            .attr("class", function(d) {
                if (d.crosses_line){return "needle hit";}
                else {return "needle miss";};
            })
            .attr("x1", d => xScale(d.x1))
            .attr("y1", d => yScale(d.y1))
            .attr("x2", d => xScale(d.x2))
            .attr("y2", d => yScale(d.y2));

        var n_crosses = (needles.filter(needle => needle.crosses_line)).length;
        var pi_estimate = 2 * (needle_length() / strip_height) * (n_needles() / n_crosses);

        d3.select("#results_div").text(`n_crosses = ${n_crosses},  \u03C0 \u2248 ${(pi_estimate).toFixed(3)}`);
    }

    // ------------  Div to hold the controls  --------------------
    var controls_div_buttons = d3.select("#simulation_controls");

    // ------------  Drop-down to select number of needles  --------------------
    var number_needles_selector = d3.select("#n-needles-drop-down").append('select');
    number_needles_selector
    	  .on('change', restart)
    	  .selectAll('option')
    	  .data([10,100,1000,10000])
    	  .enter()
    	  .append('option')
   	    .text(function (d) { return d;})
    	  .attr('value', function(d) { return d;});

    number_needles_selector
	      .property("selected",1000)
        .property("value", 1000);

    // ------------  Drop-down to select number of needles  --------------------
    var needle_length_selector = d3.select("#needle-length-drop-down").append('select');
    needle_length_selector
    	  .on('change', restart)
    	  .selectAll('option')
    	  .data([0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0])
    	  .enter()
    	  .append('option')
   	    .text(function (d) { return d;})
    	  .attr('value', function(d) { return d;});

    needle_length_selector
	      .property("selected", 0.5)
        .property("value", 0.5);

    // ------------  Control to start / stop -----------------------------------
    controls_div_buttons.append("input")
        .attr("type", "button")
        .attr("name", "restart")
        .attr("value", "Re-Draw")
        .attr("onclick", "buffon_viz.restart()");

    function restart(){
        update_needle_display();
    }

    function on_load(){
        update_needle_display();
    }

    // Export the restart function for the restart button
    return {
        restart : restart,
        on_load : on_load
    };
})();
