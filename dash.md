---
layout: page
title: Dashboards
---

Here is a dashboard I have been maintaining:

- [Weather Forecast Tracking Dashboard (Plotly+Dash)](https://paulkepley.com/weather-app/)<a id="dash-weather-app"></a><br> A weather forecast tracking dashboard built with [Dash](https://plotly.com/dash/) + [Plotly](https://plotly.com/). The data for this dashboard reflect actual measurements and forecasts for weather stations located at the largest airports in all 50 states. Data are pulled at midnight in each airport's local time-zone in multiple nightly cron-jobs, and are inserted into the SQLite database serving the dashboard. The Dashboard runs server side on a combination of [Gunicorn](https://gunicorn.org/) + Apache. Batch jobs for this project have been running nightly for this project since August 25<sup>th</sup> 2019.

  <span><svg class="svg-icon grey" style="vertical-align:-0.1875em"><use xlink:href="{{ '/assets/minima-social-icons.svg#github' | relative_url }}"></use></svg> 
  The repository for this dashboard can be [found here](https://github.com/pkepley/dash-weather-app/tree/main/src).</span>
  
