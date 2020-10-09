---
layout: page
title: Dashboards
---

Here are a few dashboards I have been maintaining:

- <u><a href ="https://paulkepley.com/shiny/covid-19/">Covid-19 Dashboard</a></u>: This
  dashboard is a tool that I have been using the past few months to
  help myself track the regional spread of Covid-19 in the United
  States. Data is sourced nightly from the [JHU CSSE COVID-19
  repository](https://github.com/CSSEGISandData/COVID-19), and served
  via Shiny server. Graphics are rendered using ggplot2. The git repository for this project may be [found here](https://github.com/pkepley/c19-dash).

- <u><a href = "https://www.paulkepley.com/weather-app">Weather Forecast Accuracy Dashboard</a></u>: This dashboard
  resulted from a series of lunch conversations about the weather. The
  data for this dashboard is sourced nightly from the NWS websiste and
  inserted into a simple SQLite database. Data are served to the user
  via Flask, and rendered client side via D3. The git repository for this project may be [found here](https://github.com/pkepley/weather-flask-app).
