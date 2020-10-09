var margin = {top: 20, right: 20, bottom: 30, left: 40},
    fullWidth = 500,
    fullHeight = 300,
    width  = fullWidth - margin.left - margin.right,
    height = fullHeight - margin.top - margin.bottom;

var parseTime = d3.timeParse("%Y-%m-%d");

Promise.all([
 d3.csv("/assets/posts/20190203_BloggingD3/USSTHPI.csv", 
  function(d) {
    return {
      date : parseTime(d.DATE),
      hpi : +d.USSTHPI
    };}),

 d3.csv("/assets/posts/20190203_BloggingD3/JHDUSRGDPBR.csv", 
  function(d) {
    return {
      date : parseTime(d.DATE),
      recessionFlag : +d.JHDUSRGDPBR
    };})
  ])
  .then(function(datasets) {
   
    dataHPI = datasets[0];
    dataRecess = datasets[1];
  
    var dateLo = d3.min(dataHPI, function(d) { return d.date;});

    var hpiLo  = d3.min(dataHPI, function(d) { return d.hpi;});
    var hpiHi  = d3.max(dataHPI, function(d) { return d.hpi;});

    var xScale = d3.scaleTime()
      .domain( d3.extent(dataHPI, function(d) { return d.date;}) )
      .range([0, width]);

    var yHi = Math.ceil( hpiHi / 100) * 100;

    var yScale = d3.scaleLinear()
      .domain([0, yHi])
      .range([height, 0]);

    var line = d3.line()
      .x(function(d) { return xScale(d.date); })
      .y(function(d) { return yScale(d.hpi); })
      .curve(d3.curveMonotoneX)

    var line2 = d3.line()
      .x(function(d) { return xScale(d.date); })
      .y(function(d) { return yScale(d.recessionFlag * yHi); })
      .curve(d3.curveStepAfter)

    var svg = d3.select(".test-div").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)
              .ticks(d3.timeYear.every(5)));

    svg.append("g")
      .attr("class", "yaxis")
      .call(d3.axisLeft(yScale));

    svg.append("path")
      .datum(dataHPI)
      .attr("class", "line")
      .attr("d", line);       

    svg.append("path")
      .datum(dataRecess.filter( function (d) { return d.date > dateLo;}))
      .attr("class", "line2")
      .attr("d", line2);       


  });
