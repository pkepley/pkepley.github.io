var state_hpi_viz = (function (){
    
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    fullWidth = 650,
    fullHeight = 250,
    width  = fullWidth - margin.left - margin.right,
    height = fullHeight - margin.top - margin.bottom;

var parseTime = d3.timeParse("%Y-%m-%d");

var state_selector_div = d3.select("#state-selector").text('Select State: ');
var state_selector = state_selector_div.append('select');
       
var svg = d3.select(".svg-container")
    .append("svg")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + fullWidth + " " + fullHeight + "")
    .classed("svg-content", true)    
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

function update_music(current_state_abbr) {
    // update the sheet music url
    var sheet_music = d3.select("#state_hpi_sheet_music");
    var sheet_music_url = sheet_music.attr("src");
    var sheet_music_url_array = sheet_music_url.split("_");
    sheet_music_url_array.pop();
    sheet_music_url_array.push(current_state_abbr + ".png");
    sheet_music_url = sheet_music_url_array.join("_");    
    sheet_music.attr("src", sheet_music_url);

    // update the audio source
    var audio_source = d3.select("#state_hpi_audio_source");
    var audio_source_url = audio_source.attr("src");
    var audio_source_url_array = audio_source_url.split("_");
    audio_source_url_array.pop();
    audio_source_url_array.push(current_state_abbr + ".ogg");
    audio_source_url = audio_source_url_array.join("_");
    audio_source.attr("src", audio_source_url);

    // update the audio
    audio = document.getElementById("state_hpi_audio");
    audio.load();
    audio.current_time = 0;
}

Promise.all([
  d3.csv("/assets/posts/20201024_HPI_Chorus/state_list.csv",
    function(d) { return d;}
  ),
    
  d3.csv("/assets/posts/20201024_HPI_Chorus/state_hpi_tidy.csv",
  function(d) {
    return {
	date : parseTime(d.date),
	state : d.abbreviation,
	hpi : +d.hpi
    };})
])
.then(function(datasets) {
    dataState = datasets[0];
    dataHPI = datasets[1];    
    
    var hpiLo  = d3.min(dataHPI, function(d) { return d.hpi; });
    var hpiHi  = d3.max(dataHPI, function(d) { return d.hpi; });
	
    dataHPI = dataHPI
    	    .filter( function (d) { return d.date >= parseTime("2000-01-01") ;});

    state_selector
    	.on('change', update)
    	.selectAll('option')
    	.data(dataState)
    	.enter()
    	.append('option')
   	.text(function (d) { return d.state;})
    	.attr('value', function(d) { return d.abbreviation;})

    state_selector
	.property("selected","CA")
        .property("value", "CA")    
     
    var dateLo = d3.min(dataHPI, function(d) { return d.date; });

    var xScale = d3.scaleTime()
    	.domain( d3.extent(dataHPI.filter( function (d) { return d.state == "CA" ;}),
    			   function(d) { return d.date;}) )
	.range([0, width]);

    var yHi = Math.ceil( hpiHi / 100 ) * 100;

    var yScale = d3.scaleLinear()
      .domain([0, yHi])
      .range([height, 0]);

    var line = d3.line()
      .x(function(d) { return xScale(d.date); })
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
	state = state_selector.property("value");
	
    	data2 = dataHPI
    	    .filter( function (d) { return d.state == state ;})
    	    .filter( function (d) { return d.date >= parseTime("2000-01-01") ;});

	svg.selectAll(".line")
	    .remove();
	
    	svg.append("path")
    	    .datum(data2)
    	    .attr("class", "line")
    	    .attr("d", line);

	update_music(state);
    }

    // call it once
    update();
});

})();
