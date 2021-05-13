---
layout: page
title: Dashboards
---

Here are a few dashboards I have been maintaining:

- [Weather Forecast Tracking Dashboard (Plotly+Dash)](https://paulkepley.com/weather-app/)<a id="dash-weather-app"></a><br> A weather forecast tracking dashboard built with Dash + Plotly. The data for this dashboard reflect actual measurements and forecasts for weather stations located at the largest airports in all 50 states. Data are pulled at midnight in each airport's local time-zone in multiple nightly cron-jobs, and are inserted into the SQLite database serving the dashboard. Batch jobs have been running nightly for this project since August 25<sup>th</sup> 2019. 

  <span><svg class="svg-icon grey" style="vertical-align:-0.1875em"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> 
  The repository for this dashboard can be [found here](https://github.com/pkepley/dash-weather-app/tree/main/src).</span>
  
- [COVID-19 Dashboard (Shiny)](https://pakepley.shinyapps.io/c19-dash/)<a id="old-covid-dashboard"></a><br> A COVID-19 tracking dashboard that I implemented in the early days of the pandemic. Data is refreshed every 12 hours from the [JHU CSSE COVID-19 repository](https://github.com/CSSEGISandData/COVID-19) from a cron-job running locally on a Raspberry Pi.  This dashboard is built with R+[Shiny](https://shiny.rstudio.com/), and is currently hosted on [shinyapps.io](https://www.shinyapps.io/).

  <span><svg class="svg-icon grey" style="vertical-align:-0.1875em"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> 
  The repository for this dashboard can be [found here](https://github.com/pkepley/c19-dash/).</span>

- [COVID-19 Dashboard (D3)](https://storage.googleapis.com/paulkepley.com/c19-dash-v2/index.html)<br>A simplified version of the COVID-19 dashboard described above. This dashboard was designed to remove the need for a remote server, and is built as a simple static site. Interactive components and graphics are handled client-side using [D3.js](https://d3js.org/). This dashboard runs on the same dataset as the Shiny version.
  
  <span><svg class="svg-icon grey" style="vertical-align:-0.1875em"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> 
  The repository for this dashboard can be [found here](https://github.com/pkepley/c19-dash-v2/).</span>

<!-- - <u><a href = "https://www.paulkepley.com/weather-app">Weather Forecast Accuracy Dashboard</a></u>: This dashboard -->
<!--   resulted from a series of lunch conversations about the weather. The -->
<!--   data for this dashboard is sourced nightly from the NWS websiste and -->
<!--   inserted into a simple SQLite database. Data are served to the user -->
<!--   via Flask, and rendered client side via D3. The git repository for this project may be [found here](https://github.com/pkepley/weather-flask-app). -->
