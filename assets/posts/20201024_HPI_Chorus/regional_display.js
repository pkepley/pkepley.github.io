var regional_hpi_viz = (function (){
    
var margin = {top: 20, right: 80, bottom: 30, left: 40},
    fullWidth = 650,
    fullHeight = 350,
    width  = fullWidth - margin.left - margin.right,
    height = fullHeight - margin.top - margin.bottom;

var parseTime = d3.timeParse("%Y-%m-%d");

var region_selector_div = d3.select("#region-selector").text("Select Region: ");
var region_selector = region_selector_div.append("select");

var svg = d3.select("#region-svg-container")
    .append("svg")
    //.attr("width",  width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight + "")
    .classed("svg-content", true)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

var legend = svg.append("g")
    .attr("transform",
          "translate(" + (margin.left + width) + "," + margin.top + ")");

function update_music(current_region) {
    // update the audio source
    var audio_source = d3.select("#region_hpi_audio_source");
    var audio_source_url = audio_source.attr("src");
    var audio_source_url_array = audio_source_url.split("/");
    audio_source_url_array.pop();
    audio_source_url_array.push(current_region.toLowerCase() + ".ogg");
    audio_source_url = audio_source_url_array.join("/");
    audio_source.attr("src", audio_source_url);

    // update the audio
    audio = document.getElementById("region_hpi_audio");
    audio.pause();
    audio.current_time = 0;
    audio.load();    
}

Promise.all([
  d3.csv("/assets/posts/20201024_HPI_Chorus/state_list.csv",
    function(d) { return d;}
  ),
    
  d3.csv("/assets/posts/20201024_HPI_Chorus/state_hpi_tidy.csv",
  function(d) {
    return {
	date : parseTime(d.date),
	region : d.region,	
	state : d.abbreviation,
	hpi : +d.hpi
    };}),

])
.then(function(datasets) {
    dataState = datasets[0];
    dataHPI = datasets[1];
    
    var hpiLo  = d3.min(dataHPI, function(d) { return d.hpi; });
    var hpiHi  = d3.max(dataHPI, function(d) { return d.hpi; });
	
    dataHPI = dataHPI
    	    .filter( function (d) { return d.date >= parseTime("2000-01-01") ;});

    var regions = ["Northeast", "Midwest", "South", "West"];
    
    region_selector
    	.on("change", update)
    	.selectAll("option")
    	.data(regions)
    	.enter()
    	.append("option")
    	.text(function (d) { return d;});
     
    var dateLo = d3.min(dataHPI, function(d) { return d.date; });

    var xScale = d3.scaleTime()
    	.domain( d3.extent(dataHPI.filter( function (d) { return d.state == "AL" ;}),
    			   function(d) { return d.date;}) )
      .range([0, width]);

    var yHi = Math.ceil( hpiHi / 100 ) * 100;

    var yScale = d3.scaleLinear()
      .domain([0, yHi])
      .range([height, 0]);

    var line = d3.line()
	.x(function(d) { console.log(d); return xScale(d.date); })
	.y(function(d) { return yScale(d.hpi);  })
	.curve(d3.curveMonotoneX)

    svg.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)
              .ticks(d3.timeYear.every(5)));

    svg.append("g")
      .attr("class", "yaxis")
    	.call(d3.axisLeft(yScale));

    function update() {
	var region = region_selector.property("value");
	
    	var data2 = dataHPI
    	    .filter( function (d) { return d.region == region ;})
    	    .filter( function (d) { return d.date >= parseTime("2000-01-01") ;})
	
	data2 = d3.nest()
	    .key(function (d) {return d.state;})
	    .entries(data2)

	svg.selectAll(".region")
	    .remove();

	var color =  d3.scaleSequential(d3["interpolateBlues"])
	    .domain([data2.length, 0])

	// mouse-over handler for lines/legend entries
	mouse_over = function (d, i) {
	    d3.selectAll(".region")
		.attr("opacity", ".25")
	    
	    d3.select("#line-" + d.key)
		.attr("stroke", "red")
		.attr("opacity", "1.0")
	    
	    d3.select("#square-" + d.key)
		.style("fill", "red")		
	}

	// mouse-out event handler for lines/legend entries	
	mouse_out = function (d, i) {
	    d3.select("#line-" + d.key)		
		.attr("stroke", color(i))
	    
	    d3.select("#square-" + d.key)
		.style("fill", color(i))

	    d3.selectAll(".region")
		.attr("opacity", "1")	    
	}

    	svg.selectAll(".region")
	    .data(data2)
	    .enter()
	    .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d, i) { return color(i) })	
            .attr("stroke-width", 2.0)
            .attr("id", function(d) { return "line-" + d.key; })		
    	    .attr("class", "region")	
	    .attr("d", function(d){
	    	return d3.line()
	    	    .x(function(d) { return xScale(d.date); })
	    	    .y(function(d) { return yScale(d.hpi);  })		
	    	    (d.values)
	    })
	    .on("mouseover", mouse_over)
	    .on("mouseout", mouse_out)

	// Swatches for the legend
	legend.selectAll(".labelsquares")
	    .remove();
	
	legend.selectAll(".labelsquares")
	    .data(data2)
	    .enter()
	    .append("rect")
    	    .attr("class", "labelsquares")
            .attr("id", function(d) { return "square-" + d.key; })	
	    .attr("x", 0)
	    .attr("y", function(d, i) { return i * (15) })
	    .attr("width", 12.5)
	    .attr("height", 12.5)
	    .style("fill", function(d, i) { return color(i) })

	// Text for the legend
	legend.selectAll(".labeltext")
	    .remove()
	
	legend.selectAll(".labeltext")
	    .data(data2)
	    .enter()
	    .append("text")
    	    .attr("class", "labeltext")		
	    .attr("x", 20)
	    .attr("y", function(d, i) { return 12.5 + i * (15) })
	    //.attr("width",  12.5)
	    .attr("font-size", 11)
	    .style("fill", "white")
	    .text(function(d) { return d.key; })


	// Invisible rectangles for handling mouse-over events
	legend.selectAll(".labelhandles")
	    .remove();
	
	legend.selectAll(".labelhandles")
	    .data(data2)
	    .enter()
	    .append("rect")
    	    .attr("class", "labelhandles")
            .attr("id", function(d) { return "handle-" + d.key; })	
	    .attr("x", 0)
	    .attr("y", function(d, i) { return i * (15) })
	    .attr("width", 45)
	    .attr("height", 12.5)
	    .style("opacity", 0)
	    .on("mouseover", mouse_over)
	    .on("mouseout", mouse_out)
	

	update_music(region.toLowerCase());
    }

    // call it once
    update();
});

})();
