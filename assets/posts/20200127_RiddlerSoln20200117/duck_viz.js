var duck_viz = (function (){
    var grid_size = 3;
    var n_ducks = 2;
    
    var width  = 200; //grid_size * cell_size;
    var height = width;
    var cell_size = width / grid_size;
    
    var margin = {top: 10, right: 10, bottom: 10, left: 10};
    
    var div_viz = d3.select("#duck_viz_div");

    var cells = Array(grid_size**2);

    var svg_div = div_viz.append("div");
    var n_duck_control_div = div_viz.append("div");
    var grid_size_control_div = div_viz.append("div");    
    
    // Make the svg 
    var svg = svg_div
	.append("svg")
	.attr("width",  width  + margin.left + margin.right)
	.attr("height", height + margin.top  + margin.bottom);
    
    // Group to hold the grid of cells
    var g = svg
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function draw_grid(grid_size) {
	// Remove all the rects to re-draw
	g.selectAll("rect")
	    .remove();
	
	// Draw the cell rectangles
	var cell_rects = g.selectAll("rect")
	    .data(cells)
	    .enter()
	    .append("rect")
	    .attr("class", "cell")
	    .attr("x", (d,i) => (i % grid_size) * cell_size)
	    .attr("y", (d,i) => Math.floor(i / grid_size) * cell_size)
	    .attr("width",  cell_size)
	    .attr("height", cell_size);
	

	return cell_rects;
    }

    cell_rects = draw_grid(grid_size);

    var xCoord = d3.scaleLinear()
	.domain([0, grid_size - 1])
	.range([cell_size / 2, width - cell_size / 2]);
    
    var yCoord = d3.scaleLinear()
	.domain([0, grid_size - 1])
	.range([height - cell_size / 2, cell_size / 2]);

    var directions = {N : [0,  1],
		      E : [1,  0],
		      S : [0, -1],
		      W : [-1, 0]}
    
    function init_duck(grid_size){
	middle_cell = Math.floor(grid_size / 2);
	return [middle_cell, middle_cell];
    }

    // Initialize
    function initialize_ducks(n_ducks, grid_size){
    	var dp = Array(n_ducks);
	
    	for (var i = 0; i < n_ducks; i++){
    	    dp[i] = init_duck(grid_size);
    	}

    	return dp;
    }

    function update_duck(pos) {
	x = pos[0];
	y = pos[1];
	okay_dirs = [];
	
	if (x > 0) okay_dirs.push(directions['W']);
	if (x < grid_size - 1) okay_dirs.push(directions['E']);
	
	if (y > 0) okay_dirs.push(directions['S']);
	if (y < grid_size - 1) okay_dirs.push(directions['N']);

	v = okay_dirs[Math.floor(Math.random() * okay_dirs.length)];

	pos_out = Array(2);
	pos_out[0] = x + v[0];
	pos_out[1] = y + v[1];
	//console.log(x,y, pos_out);

	return pos_out;
    }
    
    function update_ducks(dp_in){
    	dp_out = Array(dp_in.length);
	
    	for (var i = 0; i < n_ducks; i++){
    	    dp_out[i] = update_duck(dp_in[i]);
    	}
    	//console.log(dp);
	    
    	return dp_out;
    }
    
    function draw_ducks(dp) {
	g.selectAll(".circle")
	    .remove();

	h = cell_size * 0.35;
	var ducks = g.selectAll(".circle")
	    .data(dp)
	    .enter()
	    .append('g')
	    .classed('circle', true)
	    .attr('transform', d => 'translate(' + xCoord(d[0]) + ',' +
		  yCoord(d[1]) + ')');

	ducks
	    .append("circle")
	    .attr("r", (cell_size / 2) * 0.7)
	    .attr("fill", "yellow")
	    .attr("stroke-width", 3 * (3 / grid_size) )
	    .attr("stroke", "black");

	ducks
	    .append("text")
	    .attr("font-size", h)	
	    .attr("text-anchor", "middle")
	    .attr("alignment-baseline", "middle")
	    .attr("y", h * 0.25)
	    .text( (d,i) => i);	

	return ducks;
    }

    function ducks_together(dp) {

	for (i = 1; i < dp.length; i++){
	    if (dp[0][0] != dp[i][0] || dp[0][1] != dp[i][1]){
		return false;
	    }
	}
	
	return true;
    }

    duck_positions = initialize_ducks(n_ducks, grid_size)    
    points = draw_ducks(duck_positions);

    function tick() {
	console.log(t);
	
	if (t == 0) duck_positions = initialize_ducks(n_ducks, grid_size);
	else duck_positions = update_ducks(duck_positions);
	points = draw_ducks(duck_positions);

	setTimeout(tick, 500);

	if (t> 0 && ducks_together(duck_positions)) {
	    t = 0;
	    var ducks = g.selectAll("circle")
		.transition(125)
		.attr("fill", "green")
		.attr("stroke-width", 3 * (3 / grid_size) )
		.attr("stroke", "green");
	}
	else{
	    t += 1;
	}
	
    }

    t = 0;
    duck_positions = initialize_ducks(n_ducks, grid_size);    
    tick();

    function reset(){
	grid_size = d3.select('.select_grid_size').property('value');
	n_ducks   = d3.select('.select_n_ducks').property('value');	
	
	cell_size = width / grid_size;
	cells = Array(grid_size**2);
	
 	g.selectAll(".circle")
	    .remove();	
	
	cell_rects = draw_grid(grid_size);

	duck_positions = initialize_ducks(n_ducks, grid_size);
	t = 0;

	xCoord = d3.scaleLinear()
	    .domain([0, grid_size - 1])
	    .range([cell_size / 2, width - cell_size / 2]);
    
	yCoord = d3.scaleLinear()
	    .domain([0, grid_size - 1])
	    .range([height - cell_size / 2, cell_size / 2]);
	
    }

    var grid_size_select = grid_size_control_div
	.text('Rocks per row: ')    
	.append('select')
	.attr('class', 'select_grid_size')
	.on('change', reset)
	.selectAll('option')
	.data([3,5,7,9,11])
	.enter()
	.append('option')
	.text(function (d) { return d;});

    var n_ducks_select = n_duck_control_div
	.text('Number of ducks: ')
	.append('select')
	.attr('class', 'select_n_ducks')
	.on('change', reset)
	.selectAll('option')
	.data([2,3,4,5])
	.enter()
	.append('option')
	.text(function (d) { return d;});
    

})();
