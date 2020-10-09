---
layout: post
published: true
title: Sudoku Solver Visualization
subtitle: For a bad sudoku solver
tag: [D3, Project Euler]
usemathjax: true
---

While I was driving to work two Fridays ago, the idea to visualize a
Sudoku solver popped into my head. A few years back, I wrote a (pretty
bad) Sudoku solver to solve Project Euler [Problem
96](https://projecteuler.net/problem=96), and I wanted to *see* how it
worked. My original solver was written in Python, but I thought it
might be fun to port it into JavaScript and display the solution steps
with D3. The process turned out to be a lot less fun than I had
anticipated (mostly due to my confusion over how timers work in D3),
but I ended up getting everything working in the end. The result is
below:


<script src="{{ base  }}/assets/posts/js/d3.v5.min.js"></script>
<script src="{{ base }}/assets/posts/20190303_SudokuViz/sudoku_solver.js"></script>


<link rel="stylesheet" type="text/css" href="{{ base }}/assets/posts/20190303_SudokuViz/sudoku_viz.css"/>  


<center>
<div id="sudoku_viz_div" width = "50%"></div>
</center>

<script src="{{ base }}/assets/posts/20190303_SudokuViz/sudoku_viz.js"></script>


My solver uses a *very greedy* guess-and-check algorithm that keeps
track of a lot of candidate moves at each step. It's both bad in terms
of the number of steps required *and* the amount of RAM that it uses!
As such, the solver can take a very long time to run. The
preset frame rate for the visualization doesn't help. (For example:
run the solver on boards #9 and #25).


Maybe I'll come back to this at a later date to swap out the solver
for something more reasonable. If that ever happens, I'll probably
just crib from [this approach](http://norvig.com/sudoku.html).

