Plotly.d3.csv('/assets/posts/20190630_RubikMeans/color_means.csv', function(err, rows){
function unpack(rows, key) {
  return rows.map(function(row)
		  { return row[key]; });}

  var trace1 = {
    type: 'scatter3d',
    x: unpack(rows, 'r'),
    y: unpack(rows, 'g'),
    z: unpack(rows, 'b'),
    text: unpack(rows, 'phone'),    
    hovertemplate:
      '<b>Color:</b> <span style="text-transform: capitalize">%{marker.color}</span><br>' +
      '<b>RGB:</b> (%{x}, %{y}, %{z})<br>' +      
      '<b>Phone Image:</b> %{text}' +      
      '<extra></extra>',
    mode: 'markers',
    marker: {
      color: unpack(rows, 'color'),
      opacity : .4,
      size: 1,
      line: {
	color: 'black',
	width:   0.25,
	opacity: 0.50
      }
    }
  };

  var data = [trace1];
  var layout = {
    autosize: true,
    //height: 400,
    //width: 400,
    scene: {
      xaxis: {title: 'Red'},
      yaxis: {title: 'Green'},
      zaxis: {title: 'Blue'}      
    },
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 0
    }
  };
  Plotly.newPlot('myDiv', data, layout);
});
