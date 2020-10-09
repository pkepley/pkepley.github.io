var sudoku_viz = (function (){

  // ----------------------------------------------
  // Notational convention:
  // ----------------------------------------------
  // 1.) Tiles are the tiny squares on the board (9 x 9)
  // 2.) Cells are the 3 x 3 collections of tiles

  var transition_time = 500;

  var div_viz = d3.select("#sudoku_viz_div");
  
  var tile_size = 30; //div_viz.style('width').slice(0, -2) / 18;
  var cell_size = 3 * tile_size;
  
  
  var start_solver_flag = false;
  var stop_solver_flag  = false;
  
  // Functions to start and stop the visualizations
  var start_solver = function() { console.log("on"); start_solver_flag = true; stop_solver_flag = false;}
  var stop_solver  = function() { console.log("off"); stop_solver_flag = true; start_solver_flag = false;}

  // Function to reset the visualization. Initially set to dummy function, but modified to onchange below
  var reset = function(){};

  // Interval
  var timer = d3.timer  (
    function() {},
    transition_time    
  );

  var start_timer = function (animation_function ) {
    console.log("Start interval called");
    //interval.stop();
    //interval.timerFlush();
    //delete interval;
    sudoku_viz.timer = timer.restart(animation_function, transition_time) ;
  }

  var stop_timer = function () {
    console.log("Stop interval called");
    //interval.stop();
    //interval.timerFlush();
    //delete interval;
    sudoku_viz.timer = timer.restart (function(){}, transition_time);
  }

		  
  // Make the svg 
  var svg = div_viz
      .append("svg")
      .attr("height", 9 * tile_size)
      .attr("width",  9 * tile_size);

  // Div for controls
  var controls_div = div_viz
      .append('div')
      .style('text-align', 'center');

  // Control to select board
  var controls_div_board_select = controls_div.append('div')
      .style("width", 4.5 * tile_size)
  //.style("float", "left")
      .style("font-size", "15px")
      .style("display", "inline-block")
      .text("Select : ");

  // Control to start / stop
  var controls_div_buttons = controls_div.append("div")
      .style("display", "inline-block")
  //.style("font-size", "14px")
      .style("font-size", "13px")
      .attr("width", 4.5 * tile_size);
  
  // Hard code a vector for the cells and tiles
  var cells = Array(9);
  var tiles = Array(81);
  
  // Group to hold the 3 x 3 cells
  var g_cells = svg
      .append("g")
      .attr("transform", "translate(0,0)")

  // Group to hold the 9 x 9 tiles
  var g_tiles = svg
      .append("g")
      .attr("transform", "translate(0,0)");
   
  // Draw the cell rectangles
  var cell_rects = g_cells.selectAll("rect")
      .data(cells)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d,i) => (i % 3) * cell_size)
      .attr("y", (d,i) => Math.floor(i / 3) * cell_size)
      .attr("width", cell_size)
      .attr("height", cell_size);
     
  // Draw the tile rectangles
  var tile_rects = g_tiles.selectAll("rect")
      .data(tiles)
      .enter()
      .append("rect")
      .attr("class", "tile")
      .attr("x", (d,i) => (i % 9) * tile_size)
      .attr("y", (d,i) => Math.floor(i / 9) * tile_size)
      .attr("width", tile_size)
      .attr("height", tile_size);
   
  // Function to produce a flattened game board
  function flatten_game_board(game_board_data) {
    var game_board_flattened = Array(81);
    for (var i = 0; i < 9; i++){
      for (var j=0; j < 9; j++){
	game_board_flattened[9 * i + j] = {
	  board_id: game_board_data[i].board_id,
	  row_id: i+1,
	  col_id: j+1,
	  fixed_cell: (game_board_data[i].row[j] > 0),
	  value: game_board_data[i].row[j]
	};
      }	  
    }
    return game_board_flattened;
  }

  // Function to update a flattened board with a new array of board values
  function update_board_values(game_board_flattened, new_board_values) {
    for (var i = 0; i < 9; i++){
      for (var j=0; j < 9; j++){
	//if (game_board_flattened[9 * i + j].value != new_board_values[i][j]) {
    	  game_board_flattened[9 * i + j].value = new_board_values[i][j];
	//}
      }
    }
  }
  
  // Function to update the visualization
  function update_board_viz( game_board_flattened,  new_board_values) {

    var t = d3.transition()
	.duration(transition_time);
    
    // Update flattened game board with new values
    update_board_values(game_board_flattened, new_board_values);
    
    // Add text for each of the tiles
    g_tiles.selectAll("text").remove();
    
    var tile_text = g_tiles.selectAll("text")
	.data(game_board_flattened, d => d);
    
    // Update
    tile_text.attr("dy", ".35em")
      .attr("class", function(d) {
	if (d.fixed_cell) { return "fixed_tile_value";}
	else if (d.value > 0) { return "enter_tile_value";}
	else {return "NA";}
      })
      .transition(t)
      .attr("x", (d,i) => ((i % 9) + 0.375) * tile_size)
      .attr("y", (d,i) => (Math.floor(i / 9) + 0.5) * tile_size)
      .attr("width",  tile_size)
      .attr("height", tile_size);
	
    // Enter
    tile_text.enter().append("text")
      .attr("class", function(d, i) {
	if (d.fixed_cell) { return "fixed_tile_value"; }
	else if (d.value > 0) { return "enter_tile_value"; }
	else { return "NA"; }
      })
      .text( function(d) {
	if (d.value == 0) { return ""; }
	else { return d.value; }
      })
      .merge(tile_text)
      .attr("dy", ".35em")
      .attr("x", (d,i) => ((i % 9) + 0.375) * tile_size)
      .attr("y", (d,i) => (Math.floor(i / 9) + 0.5) * tile_size)
      .attr("width",  tile_size)
      .attr("height", tile_size)
      .transition(t);    

    // // Exit
    // tile_text.exit()
    //   .attr("class", "exit_tile_value")
    //   .transition(t)
    //   .style("fill-opacity", 1e-6)
    //   .remove();

    return tile_text;
  }


  function change_board(all_board_data, board_id) {
    
    // Select the game-board from the list
    var game_board_data_orig = all_board_data
	.filter(e => e.board_id == board_id);

    // Make a deep-copy of the game board:
    game_board_data = Array(9);
    for (var i = 0; i < 9; i++){
      var row_tmp = Array(9);
      for (var j = 0; j < 9; j++){
	row_tmp[j] = game_board_data_orig[i].row[j];
      }
      game_board_data[i] = {
	board_id : game_board_data_orig[i].board_id,
	row_id : game_board_data_orig[i].row_id,
	row : row_tmp
      }
    }
	
    // Flatten the game-board so that there is one data point per tile (81 total)
    var game_board_flattened = flatten_game_board(game_board_data);

    // Add text for each of the tiles
    g_tiles.selectAll("text").remove();

    var tile_text = g_tiles.selectAll("text")
      	.data(game_board_flattened, d => d);
    
    // Update
    tile_text.attr("dy", ".35em")
      .attr("class", function(d) { if (d.fixed_cell) { return "fixed_tile_value"; }
				   else { return "NA"; }
				 })		
      .attr("x", (d,i) => ((i % 9) + 0.375) * tile_size)
      .attr("y", (d,i) => (Math.floor(i / 9) + 0.5) * tile_size)
      .attr("width",  tile_size)
      .attr("height", tile_size);
	
    // Enter
    tile_text.enter().append("text")
      .attr("class", function(d) { if (d.fixed_cell) { return "fixed_tile_value"; }
				   else { return "NA"; }
				 })	
      .text( function(d) { if (d.value == 0) { return "";} else { return d.value;}})
      .merge(tile_text)
      .attr("dy", ".35em")
      .attr("x", (d,i) => ((i % 9) + 0.375) * tile_size)
      .attr("y", (d,i) => (Math.floor(i / 9) + 0.5) * tile_size)
      .attr("width",  tile_size)
      .attr("height", tile_size);

    
    // If the board id isn't set (ie if we just opened the visualization) set
    // the board selection
    // board_id_selection = d3.select('select').property('value', board_id);
    
	
    // call the solver visualizer
    run_solver_visualization(game_board_data, game_board_flattened); //, tile_text );
    
    return tile_text;
  }


  function run_solver_visualization(game_board_data, game_board_flattened) { //, tile_text) {

    // Flatten
    game_board_flattened = flatten_game_board(game_board_data);
	
    // Solve board
    console.log(game_board_data.map( d => d.row));

    var solver_data = {
      board : game_board_data.map( d => d.row),
      guess_points : [],
      branch_boards : [],
      n_steps : 0
    }

    animation_function = function() {
      
      if ( start_solver_flag ) {
	
	sudoku_solver.solve_board_step(solver_data);
	update_board_viz( game_board_flattened, solver_data.board);
	//console.log(game_board_data[0].board_id);
	//console.log(solver_data.board);

	
	if ( !sudoku_solver.not_solved(solver_data.board) ){
	  stop_timer();
	  sudoku_viz.stop_solver();
	  console.log(solver_data.board);
	}
	
	if ( stop_solver_flag ){
	  stop_timer();
	  sudoku_viz.stop_solver();
	}
	
      }
    }

    start_timer(animation_function);
    
  }

  
  // Display Sudoku
  d3.csv("/assets/posts/20190303_SudokuViz/prob96.csv", function(d) {
    return {      
      board_id: +d.Board,
      row_id: +d.Row,
      row: [+d.C1, +d.C2, +d.C3, +d.C4, +d.C5, +d.C6,
	    +d.C7, +d.C8, +d.C9]      
    };})
    .then(function(all_board_data){

      // Create a list of all of the available board_id's. Should just be 1-50,
      // But may be larger if I change the data. So don't hard code.
      var min_board_id  = Math.min.apply(Math, all_board_data.map(d => d.board_id));
      var max_board_id  = Math.max.apply(Math, all_board_data.map(d => d.board_id));      
      var board_id_list = Array(max_board_id - min_board_id + 1);
      for (var i=0; i < board_id_list.length; i++){
	board_id_list[i] = min_board_id + i;
      }
            
      // Append the board_id option menu.
      var select = controls_div_board_select
	  .append('select')
  	  .attr('class','select')
	  .on('change', onchange)

      // Add start button
      controls_div_buttons.append("input")
      	.attr("type", "button")
      	.attr("name", "start")
      	.attr("value", "Start")
      	.attr("onclick", "sudoku_viz.start_solver()");
      
      // Add stop button
      controls_div_buttons.append("input")
	.attr("type", "button")
	.attr("name", "stop")
	.attr("value", "Stop")
	.attr("onclick", "sudoku_viz.stop_solver()");

      // Add stop button
      controls_div_buttons.append("input")
	.attr("type", "button")
	.attr("name", "reset")
	.attr("value", "Reset")
	.attr("onclick", "sudoku_viz.reset()");
      
      // Instantiate the option list
      var options = select
	  .selectAll('option')
	  .data(board_id_list)
	  .enter()
	  .append('option')
	  .text(function (d) { return d; });

      // Define what happens when the menu list is udpated.
      function onchange() {

	start_solver = false;
	stop_solver  = false;
	
	stop_timer();
	
	board_id_selection = d3.select('select').property('value');	
	change_board(all_board_data, board_id_selection);
      };      

      // Update the reset button so it is actually usable!
      sudoku_viz.reset = onchange;
      
      onchange();
      
    });

  return {
    start_solver : start_solver,
    stop_solver : stop_solver,
    reset : reset
  }
})();
