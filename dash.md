---
layout: page
title: Dashboards
---

Here are a few dashboards I have been maintaining:

- <u><a href ="https://storage.googleapis.com/paulkepley.com/c19-dash-v2/index.html">Covid-19 Dashboard (D3)</a></u>: This 
  dashboard replaces the dashboard <a href="#old-covid-dashboard">described below</a>, which I created in the early days of the pandemic to 
  help me understand the regional spread of Covid-19 in the United
  States. The data is still being refreshed, and is sourced nightly from the [JHU CSSE COVID-19 repository](https://github.com/CSSEGISandData/COVID-19). Data is processed locally before being uploaded to Google storage by a process running on a a Raspberry Pi 4b. Graphics are rendered client-side using D3.js. 

  <span><svg class="svg-icon grey" style="vertical-align:-0.1875em"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> 
  The repository for this dashboard can be [found here](https://github.com/pkepley/c19-dash-v2/).</span>


- <u><a href="https://pakepley.shinyapps.io/c19-dash/">Covid-19 Dashboard (Shiny)</a></u><a id="old-covid-dashboard"></a>: My initial COVID-19 tracking dashboard, which I've now migrated over to [ShinyApps.io](https://www.shinyapps.io). Data may be outdated.

  <span><svg class="svg-icon grey" style="vertical-align:-0.1875em"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> 
  The repository for this dashboard can be [found here](https://github.com/pkepley/c19-dash/).</span>

<!-- - <u><a href = "https://www.paulkepley.com/weather-app">Weather Forecast Accuracy Dashboard</a></u>: This dashboard -->
<!--   resulted from a series of lunch conversations about the weather. The -->
<!--   data for this dashboard is sourced nightly from the NWS websiste and -->
<!--   inserted into a simple SQLite database. Data are served to the user -->
<!--   via Flask, and rendered client side via D3. The git repository for this project may be [found here](https://github.com/pkepley/weather-flask-app). -->
