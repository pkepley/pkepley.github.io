var sudoku_solver = (function (){
  
// Copy board
function copy_board(in_board) {
  var out_board = Array(9);
  
  for (i = 0; i < 9; i++) {
    out_board[i] = Array(9);
    for (j = 0; j < 9; j++) {
      out_board[i][j] = in_board[i][j];
    }
  }
  
  return out_board;
}

function last_value(an_array) {
  return an_array[an_array.length - 1];
}

// Square index
function square_index(i,j){
  return 3*Math.floor(i/3) + Math.floor(j/3);
}

// Transpose a 2-D array
function transpose(array){
  return array[0].map((col, i) => array.map(row => row[i]));
}

// Range function [lo, hi)
function range(lo, hi) {
  var n = hi-lo+1;
  var range = Array(n);
  for (var i = lo; i < hi; i++) {
    range[i] = i;
  }
  return range;
}

// initialize row possibilities after reading a board (used once)
function init_row_poss(board){
  var r_possibles = Array();
  for (i = 0; i < board.length; i++) {
    r_possibles.push(range(1, 10).filter( m => !( board[i].includes(m) )));
  }
  return r_possibles
}

// initialize col possibilities after reading a board (used once)
function init_col_poss(board){
  return init_row_poss(transpose(board));
}

// initialize square possibilites after reading a board (used once)
function init_sqr_poss(board){
  var square_possibles = []
  for (var i = 0; i < 3; i++){
    for (var j = 0; j < 3; j++){
      var square_vals = []
      for (l = 3*i; l < 3*(i+1); l++) {
	for (k = 3*j; k < 3*(j+1); k++) {
	  square_vals.push(board[l][k]);
	  //square_possibles.append([m for m in range(1,10) if m not in square_vals])	  
	}
      }
      square_possibles.push( range(1, 10).filter( m => !(square_vals.includes(m))) );
    }
  }
  return square_possibles;
}


// find all the initial possibilities for the board
function init_board_poss(board){
  var r_poss = init_row_poss(board);
  var c_poss = init_col_poss(board);
  var s_poss = init_sqr_poss(board);
  
  var cell_poss = Array();
  for (i = 0; i < 9; i++){
    
    var cell_poss_row = Array();    
    for (j = 0; j < 9; j++){
      
      if (board[i][j] == 0) {	
	var sq_i = Math.floor(i / 3);
	var sq_j = Math.floor(j / 3);
	var sq_index = 3*sq_i + sq_j
	
	var poss = range(1, 10).filter(m => r_poss[i].includes(m) &&
				       c_poss[j].includes(m) &&
				       s_poss[sq_index].includes(m));
	cell_poss_row.push(poss);

      }      
      else {
	cell_poss_row.push( Array() );
      }      
    }
    cell_poss.push(cell_poss_row);
  }
  
  return cell_poss;
}


function update_cell_poss(cell_poss, i, j, val) {
  for (var row_ind = 0; row_ind < 9; row_ind++) {
    if (row_ind != i){
      if (cell_poss[row_ind][j].includes(val)) {
	cell_poss[row_ind][j] = cell_poss[row_ind][j].filter( m => m != val);
      }
    }
  }

  for (var col_ind = 0; col_ind < 9; col_ind++){
    if (col_ind != j){
      if (cell_poss[i][col_ind].includes(val)) {
	cell_poss[i][col_ind] = cell_poss[i][col_ind].filter( m => m != val);
      }
    }
  }

  i_over_3 = Math.floor(i/3);
  j_over_3 = Math.floor(j/3);
  
  	
  for (var l = 3 * i_over_3; l < 3 * i_over_3 + 3; l++) {
    for (var m = 3 * j_over_3; m < 3 * j_over_3 + 3; m++) {
      if ((l,m) != (i,j)) {
	if (cell_poss[l][m].includes(val)) {
	  cell_poss[l][m] = cell_poss[l][m].filter( m => m != val);
	}
      }
    }
  }

  return cell_poss;
}


function update_board(board) {
  var cell_poss = init_board_poss(board);
  for (var i = 0; i < cell_poss.length; i++) {

    var row = cell_poss[i];    
    for (var j = 0; j < row.length; j++) {
      
      var entry = row[j];
      if (entry.length == 1) {
	board[i][j] = entry[0];
	cell_poss = update_cell_poss(cell_poss, i, j, entry[0]);
      }
    }
  }
  return board;
}

function find_nonzero_min(cell_poss) {
  var m = 10

  for (var i = 0; i < cell_poss.length; i++) {
    row = cell_poss[i];
    
    // compute the length of possibilities
    var r_len = row.map( e => e.length );
    var r_nonzero = r_len.filter( e => e > 0);

    if (r_nonzero.length > 0) {
		  
      if (Math.min.apply(Math, r_nonzero) < m) {
	
	var m = Math.min.apply(Math, r_nonzero);
	var j = r_len.indexOf(m);	
	var ind_at_min = [i,j];

      }
    }
  }
  
  if ( m == 10 ) {
    ind_at_min = Array();
  }
  
  return ind_at_min;
}

function choices_exist(cell_poss) {
  var length_by_cell = cell_poss.map( row => row.map( e => e.length));
  var max_by_row = length_by_cell.map( row => Math.max.apply(Math, row) );
  var max_all = Math.max.apply(Math, max_by_row);

  return max_all > 0 ;
}


function not_solved(board) {
 
  var min_by_row = board.map( row  => Math.min.apply(Math, row));
  var min_all = Math.min.apply(Math, min_by_row);

  return min_all == 0;
}

function solve_board(board) {
  var new_board = copy_board(board);
  var guess_points = [];
  var branch_boards = [];
  var n_steps = 0;
  
  while (not_solved(new_board)) {
    
    new_board = update_board(new_board);    
    cell_poss = init_board_poss(new_board);
    
    // Find the indices of any cell which has at least one
    // possibility.
    non_zero_min_indices = find_nonzero_min(cell_poss);
    
    if ( non_zero_min_indices.length > 0 ) {
      
      var i = non_zero_min_indices[0];
      var j = non_zero_min_indices[1];
      
      // if there is more than one possibility at the min (i,j),
      // then we need to make a choice at (i,j). Always choose
      // the last possibility.  it will be updated later if needed.
      if ( cell_poss[i][j].length > 1) {
	branch_boards.push( copy_board(new_board) );
	guess_points.push([[i, j], cell_poss[i][j]]);
	new_board[i][j] = last_value( last_value(guess_points)[1] );
      }

    }
    
    // no choices remain anywhere
    else if ( not_solved(new_board) ) {
      
      while ( last_value( last_value( guess_points)).length == 1) {
    	guess_points.pop();
	branch_boards.pop();

      }
	    
      // pop  off the last guess
      var last_guess = guess_points.pop();
      var last_guess_vals = last_guess.pop();

      // if there is more than one possibility remaining in our
      // last guess, then switch to it. Update the list
      // accordingly
      if ( last_guess_vals.length > 1 ) {
	last_guess_vals.pop();
	last_guess.push(last_guess_vals);
	guess_points.push(last_guess);
      }

      // there are no more choices remaining 
      else {
	new_board = copy_board( branch_boards.pop() ) ;
      }

      new_board = copy_board( last_value(branch_boards) );
      
      i = last_value(guess_points)[0][0];
      j = last_value(guess_points)[0][1];

      
      new_board[i][j] = last_value(last_value(guess_points)[1]);
    }
    
  }

  console.log( n_steps );
  return new_board;
}


function solve_board_stepwise(board){
  var solver_data = {
    board : board,
    guess_points : [],
    branch_boards : [],
    n_steps : 0
  }

  while (not_solved(solver_data.board))  {
    solve_board_step(solver_data);
  }
  console.log( n_steps );
  return new_board;
}


function solve_board_step(solver_data) {
  board = solver_data.board;
  guess_points = solver_data.guess_points;
  branch_boards = solver_data.branch_boards;
  n_steps = solver_data.n_steps;
  
  new_board = update_board(board);    
  cell_poss = init_board_poss(new_board);
    
  // Find the indices of any cell which has at least one
  // possibility.
  non_zero_min_indices = find_nonzero_min(cell_poss);
    
  if ( non_zero_min_indices.length > 0 ) {
    
    var i = non_zero_min_indices[0];
    var j = non_zero_min_indices[1];
      
    // if there is more than one possibility at the min (i,j),
    // then we need to make a choice at (i,j). Always choose
    // the last possibility.  it will be updated later if needed.
    if ( cell_poss[i][j].length > 1) {
      branch_boards.push( copy_board(new_board) );
      guess_points.push([[i, j], cell_poss[i][j]]);
      new_board[i][j] = last_value( last_value(guess_points)[1] );
    }
    
  }
    
  // no choices remain anywhere
  else if ( not_solved(new_board) ) {
      
    while ( last_value( last_value( guess_points)).length == 1) {
      guess_points.pop();
      branch_boards.pop();
      
    }
    
    // pop  off the last guess
    var last_guess = guess_points.pop();
    var last_guess_vals = last_guess.pop();
    
    // if there is more than one possibility remaining in our
    // last guess, then switch to it. Update the list
    // accordingly
    if ( last_guess_vals.length > 1 ) {
      last_guess_vals.pop();
      last_guess.push(last_guess_vals);
      guess_points.push(last_guess);
    }
    
    // there are no more choices remaining 
    else {
      new_board = copy_board( branch_boards.pop() ) ;
    }
    
    new_board = copy_board( last_value(branch_boards) );
    
    i = last_value(guess_points)[0][0];
    j = last_value(guess_points)[0][1];
    
    
    new_board[i][j] = last_value(last_value(guess_points)[1]);
  }

  solver_data.board = new_board;
  solver_data.guess_points = guess_points;
  solver_data.branch_boards = branch_boards;
  solver_data.n_steps = n_steps + 1;

  return new_board;
}
  return {
    solve_board_step : solve_board_step,
    not_solved : not_solved
  }
})();
