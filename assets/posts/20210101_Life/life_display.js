var life_viz = (function (){

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    fullWidth = 300,
    fullHeight = fullWidth,
    width  = fullWidth - margin.left - margin.right,
    height = fullHeight - margin.top - margin.bottom;

var n_rows_options = [10, 25, 50, 75, 100];
    
var n_rows = 50;
var n_cols = n_rows;
var n_squares = n_rows * n_rows;
var cell_size = fullWidth / n_cols;
    
var svg = d3.select(".svg-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)    
    .classed("svg-content", true)    
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Control to start / stop
var controls_div_buttons = d3.select(".svg-container")
    .append("div");

// Select size
var drop_down_div = controls_div_buttons.append("div").text("Size: ");

size_selector = drop_down_div.append("select");
size_selector
	.on("change", restart)    
	.selectAll("option")
	.data(n_rows_options)
	.enter()
	.append("option")
	.text((d) => d)
	.attr("value", (d) => d);
size_selector.property("selected", n_rows)
	.property("value", n_rows)


// Restart button
drop_down_div.append("input")
    .attr("type", "button")
    .attr("name", "restart")
    .attr("value", "Restart")
    .attr("onclick", "life_viz.restart()");
    
// Function to generate random life array
function random_life_array(n_rows, n_cols, p_thresh = 0.25 ) {
    let life_array = Array.from(Array(n_rows), () => new Array(n_cols).fill(false));

    for (var i = 0; i < n_rows; i++){
	for (var j = 0; j < n_cols; j++){
	    life_array[i][j] = Math.random() < p_thresh;
	}
    }	  

    return life_array;
}

// Function to flatten life data
function flatten_life_array(life_array) {
    var n_rows = life_array.length;
    var n_cols = life_array[0].length;	
    var life_flattened = Array(n_rows * n_cols);
    
    for (var i = 0; i < n_rows; i++){
	for (var j = 0; j < n_cols; j++){
	    life_flattened[n_cols * i + j] = {
		i: i,
		j: j,
		alive: life_array[i][j]
	    }
	}	  
    }
    return life_flattened;
}

// Function to flatten life data
function flatten_life_data(life_array) {
    var n_rows = life_array.length;
    var n_cols = life_array[0].length;	
    var living_cells = new Set();
    
    for (var i = 0; i < n_rows; i++){
	for (var j = 0; j < n_cols; j++){
	    if (life_array[i][j]) living_cells.add(`${i}_${j}`);
	}	  
    }
    return living_cells;
}

// neighboring indices to (i, j)
function neighbor_idxs(i, j, n_rows, n_cols) {
    var ilo, ihi, jlo, jhi;
    var nbrs = Array(8);

    ilo = (i == 0) ? (n_rows - 1) : i - 1;
    ihi = (i + 1) % n_rows;
    jlo = (j == 0) ? (n_cols - 1) : j - 1;
    jhi = (j + 1) % n_cols;

    nbrs = [[ilo,jlo], [ilo,j], [ilo,jhi], [i,jlo], [i,jhi], [ihi,jlo],
    	    [ihi,j], [ihi,jhi]];
    
    return nbrs;
}

// new state for current cell
function new_state(life_array, i, j) {
    var n_rows = life_array.length;
    var n_cols = life_array[0].length;    
    var nbr_idxs = neighbor_idxs(i, j, n_rows, n_cols);
    var nbrs = nbr_idxs.map(k => life_array[k[0]][k[1]]);
    var n_nbrs_alive = nbrs.reduce((a, b) => { return a + b;});
    
    if (life_array[i][j] == true) {	
	return (n_nbrs_alive == 2) || (n_nbrs_alive == 3);
    }
    else {
	return n_nbrs_alive == 3;
    }
}

// perform the update
function update_life_array(life_array, living_cells) {
    var n_rows = life_array.length;
    var n_cols = life_array[0].length;
    var new_life_array = Array.from(Array(n_rows), () => new Array(n_cols).fill(false));
    var new_living_cells = new Set();
    
    var i, j, cell_new_state, nbr_cell, nbrs;

    for (let cell of living_cells) {	
	k = cell.split("_").map(d => +d);
	i = k[0], j = k[1];
	
	// update cell
	cell_new_state = new_state(life_array, i, j);
	
	if (cell_new_state == true) {
	    nbr_cell = `${i}_${j}`;			    
	    new_living_cells.add(nbr_cell);
	}
	new_life_array[i][j] = cell_new_state;
	
	// update cells's neighbors
	nbrs = neighbor_idxs(i, j, n_rows, n_cols);
	
	for (let idx_cell_nbr of nbrs) {
 	    i = idx_cell_nbr[0];
	    j = idx_cell_nbr[1];
	    cell_new_state = new_state(life_array, i, j);
	    
	    if (cell_new_state == true) {
		nbr_cell = `${i}_${j}`;
		new_living_cells.add(nbr_cell);
	    }
	    new_life_array[i][j] = cell_new_state;
	}
    }   
    
    return {new_array: new_life_array, new_cells : new_living_cells};
}

// start the simulation
life_array = null;//random_life_array(n_rows, n_cols);
living_cells = null;//flatten_life_data(life_array);
life_array_flat = null;//flatten_life_array(life_array);

// Draw the cell rectangles
function init_display() {
    // update the globals
    life_array = random_life_array(n_rows, n_cols);
    living_cells = flatten_life_data(life_array);
    life_array_flat = flatten_life_array(life_array);

    // remove any rects
    svg.selectAll("rect").remove();

    // append rects
    var cell_rects = svg.selectAll("rect")
	.data(life_array_flat)
	.enter()
	.append("rect")
	.attr("id", (d,i) => `cell_${Math.floor(i / n_cols)}_${i % n_cols}`)
	.attr("class", function(d) {
    	    if (d.alive) { return "alive";}	
    	    else {return "dead";}
	})
	.attr("x", (d,i) => (i % n_cols) * cell_size)
	.attr("y", (d,i) => Math.floor(i / n_cols) * cell_size)
	.attr("width", cell_size)
	.attr("height", cell_size);
}
		
// update the display
function update_display(){
    // keep track of what *was* alive last tick
    old_living_cells = new Set([...living_cells]);

    // what is alive on *current* tick
    life_data = update_life_array(life_array, living_cells);

    // update the globals
    life_array = life_data["new_array"];
    living_cells = life_data["new_cells"];
    life_array_flat = flatten_life_array(life_array);    
    
    // changes between last and current ticks
    newly_dead = [...old_living_cells].filter(c => !living_cells.has(c));
    newly_living = [...living_cells].filter(c => !old_living_cells.has(c));

    // turn on the new living cells in image
    for (let cell of newly_living) {	
	cell_id = `#cell_${cell}`;
	svg.select(cell_id).attr("class", "alive");
    }

    // eschew the dead cells from the image
    for (let cell of newly_dead) {	
	cell_id = `#cell_${cell}`;
	svg.select(cell_id).attr("class", "dead");
    }
}
    
// init and start timer
init_display();		
var displayTimer = setInterval(update_display, 500);

// restart
function restart() {
    // update some globals
    n_rows = +size_selector.property("value");
    n_cols = n_rows;
    n_squares = n_rows * n_rows;
    cell_size = fullWidth / n_cols;

    // reset interval and start updating display again
    clearInterval(displayTimer);    
    init_display();    
    displayTimer = setInterval(update_display, 500);    
}
       
    
// Export the button
return {
    restart : restart
}
    
})();
