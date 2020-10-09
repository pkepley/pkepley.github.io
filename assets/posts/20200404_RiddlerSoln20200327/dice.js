// Math 
function first_n_integers(n){
    var a = Array(n);
    for (i=1; i <= n; i++){
	a[i-1] = i;
    }
    return a;
}

function all_equal(a){
    for (i=1; i < a.length; i++){
	if(a[i] != a[i-1]){
	    return false;
	}
    }
    return true;      
}

function sample_from_array(a) {
    alphabet = a.map(x => a[Math.floor(Math.random() * a.length)]);
    return alphabet;
}

function frequency_counts(a) {
    var counts = {};
    
    for (i = 0; i < a.length; i++){
	var v = a[i];
	counts[v] = counts[v] ? counts[v] + 1 : 1;	  
    }
    
    return counts;
}

function uniqueness_type(a) {
    var counts = frequency_counts(a);
    var ut = [];
    for (var k in counts) {
	ut.push(counts[k]);
    }
    return ut.sort((a,b) => b - a);
}

function sort_descending_freq(a){
    var counts = frequency_counts(a);
    a.sort(function(x,y) {
	if (counts[y] == counts[x]) {
	    return x - y;
	}
	else{
	    return counts[y] - counts[x];
	}
    });
    
    return a;
}

function next_round(){
    if (all_equal(alphabet)) {
	alphabet = first_n_integers(alphabet.length);
	n_runs += 1;
	n_rounds += 1;
	n_rounds_total += n_rounds;
	
	// new round
	n_rounds = 0;	  
	new_round = true;
    }
    else {
	alphabet = sample_from_array(alphabet);
	n_rounds += 1;
	new_round = false;
    }
    
    alphabet = sort_descending_freq(alphabet);
    //console.log(uniqueness_type(alphabet));
    
    return alphabet;
}

//nction sort_integer

var n_sides = 6;
var step_duration = 1250;
var alphabet = first_n_integers(n_sides);
var n_rounds = 0;
var n_runs = 0;
var n_rounds_total = 0;
var new_round = true;

var square_size = 50,
    pad = 1,
    width = 6 * square_size + 2*pad,
    height = square_size + 2*pad;

var viz_container = d3.select("#summary_div");

var svg = viz_container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g").attr("transform", "translate(" + pad + "," + pad + ")");

var viz_summary_tbl = viz_container.append("table");
var viz_summary_tbl_run_row = viz_container.append("tr")
    .style("text-align", "left")
    .style("font", "10pt sans-serif");
var viz_summary_tbl_avg_row = viz_container.append("tr")
    .style("text-align", "left")
    .style("font", "10pt sans-serif");
var viz_summary_tbl_round_row = viz_container.append("tr")
    .style("text-align", "left")
    .style("font", "10pt sans-serif");

  
var rects = g.selectAll("rect")
      .data(alphabet)
      .enter()
      .append("rect")
      .attr("x", (d,i) => i * square_size)
      .attr("y", 0)
      .attr("width", square_size)
      .attr("height", square_size)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

function update(data) {
    var t = d3.transition()
	.duration(step_duration / 2);
    
    // JOIN new data with old elements.
    var text = g.selectAll("text")
 	.data(data, function(d, i) {  return [d,i]; });
    
    // EXIT old elements not present in new data.
    text.exit()
       	.attr("class", "exit")
       	.transition(t)
       	.attr("y", square_size / 2)
        .style("fill-opacity", 1e-6)
        .remove();
    
    var absorbing_state = all_equal(data);
    
    if (absorbing_state) {
	update_class = "all_match";
	enter_class  = "all_match";
    }
    else {
	update_class = "update";
	enter_class  = "enter";
    }
    
    // UPDATE old elements present in new data.
    text.attr("class", update_class)
       	.attr("y", square_size / 2)
       	.style("fill-opacity", 1)
       	.transition(t)
       	.attr("x", function(d, i) { return (i + 0.25) * square_size; });
    
    text.enter().append("text")
      	.attr("class", enter_class)
       	.attr("dy", ".35em")
       	.attr("y", -60)
       	.attr("x", function(d, i) { return (i + 0.25) * square_size; })
       	.style("fill-opacity", 1e-6)
       	.text(function(d) { return d; })
       	.transition(t)
       	.attr("y", square_size / 2)
       	.style("fill-opacity", 1);

    // Update the table
    avg = n_rounds_total / n_runs;    
    viz_summary_tbl_run_row.text("Simulations completed: " + n_runs);
    viz_summary_tbl_avg_row.text("Empirical average: " + avg.toFixed(3));
    viz_summary_tbl_round_row.text("Rounds simulated (this run): " + n_rounds);    
}

// The initial display.
update(alphabet);

// Grab a random sample of letters from the alphabet, in alphabetical order.
d3.interval(function() {
    update(next_round());
}, step_duration);
