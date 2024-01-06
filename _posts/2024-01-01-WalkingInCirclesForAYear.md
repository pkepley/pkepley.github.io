---
layout: post
published: true
title: Walking in Circles for a Year
tag: [GPS, animation]
---

Happy New Year! 
In this post, I'll show the outcome of my New Year's resolution for 2023, which involved a *lot* of walking in circles and some over-complicated graphs!

## Last Year's Resolution
I've never really been someone who makes New Year's resolutions and, before 2023, I never maintained a New Year's resolution for more than a couple of weeks.
This past year, I made a resolution to get some more consistent exercise.
I had become pretty sedentary during the pandemic, since most of my pre-pandemic exercise came from walking around the city I lived in (I currently live in the suburbs) and walking (often sprinting) to and from the train I used to [take to work](https://paulkepley.com/2020-04-25-CovidCommute/).
At the start of 2023, I resolved to start jogging a few times a week. 
To prepare for more intense activity, I started walking 3 - 4 times a week, but I ultimately never got around to jogging -- my knee didn't really seem to like the idea, and honestly, walking is more of my speed anyhow 🙂.

As a hedge against laziness, I decided to gameify the process a bit, by tracking my progress through Strava.
While Strava's free tier provides some useful tracking features, I quickly started extracting my data from the app and building some [bespoke tooling to manage it](https://github.com/pkepley/activity-summarizer)
Admittedly, if I hadn't invested the time into building tools... I likely would have gotten bored of the walking and fizzled out early on in the year.
One of the core features of my activity tracker (which was probably the most motivating feature) was an animation that allowed me to simultaneously see all of the walks I had taken, which I've exported and posted below:

<iframe width="560" height="315" src="https://www.youtube.com/embed/9i1UzYBNLJ0?si=iaq2e6dlwLO7T7hp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="max-width:100%;"></iframe>

In the above animation, you can see me walking around my local walking path on 245 separate occasions. 

When new exercises are ingested into my tool, routes are automatically collated into similar routes  using an [agglomerative clusterer](https://en.wikipedia.org/wiki/Hierarchical_clustering).
The main motivation behind clustering similar routes together is so that they could be color-coded together for the animation.
I could have done this by hand... but there wouldn't have been any fun in that.
Getting the clusterer to work in a sensible way required a lot of finagling, but it should theoretically generalize to any path without requiring human intervention -- although I only ever run it against activities on the same walking path 🙂.

At some point, I intend to write up a summary of the clusterer (and the annoying journey I took on getting it to work properly) as well as some of my tool's other (weirder) features, but for now, I just wanted to record a year of walking in circles and to say Happy New Year!
