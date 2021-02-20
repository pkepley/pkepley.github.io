---
layout: post
published: true
title: FunkyDuino
tag: [Arduino]
---

FunkyDuino. Or, How I learned to stop worrying and built an annoying
Funky Town music box.

## Background
A little over a year ago, I purchased an Arduino to play around
with. At the time, I was writing a (intentionally bad) [Rubik's cube
solver](https://github.com/pkepley/rubiksolver), which was designed to
allow a user to take some pictures of their Rubik's cube and receive a
guided walk-through for a fairly inefficient solution. My ultimate
goal for the project / Arduino, was to drive a simple robot that would
perform the task of both imaging the cube and solving it for
me. However, because I like the idea of useless robots more than
useful ones... I planned for the robot to re-scramble the cube after
solving it, in order to make it a Sisyphean Rubik's cube solver.

In the end, I ended up shelving the project before I really even
learned how to use the Arduino. However, since it's still pretty early
in this year, and since I've been trying to both learn new things and to
make progress on old projects, I have recently picked
the Arduino back up. There's no guarantee that I'll get around to
making my Sisyphus solver, but it's still fun to play around with the
board.

In that spirit, I've recently begun playing around with some much
simpler projects for the Arduino, and the other night, I spent some
time hard-coding the notes to Funky Town into it:

<center>
<iframe width="560" height="315" src="https://www.youtube.com/embed/z-enXiFsuAM" frameborder="0" allow="accelerometer; autoplay; clipboad-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="max-width:100%;"></iframe>
</center>


For the curious, I'm including code and a close-up of the board so
anyone interested can work-out how to set up something similar. My
solution for the musical portion is pretty inelegant, but hey, it does
what it says on the tin.... it plays Funky Town 😃. The set-up only
requires an Arduino, one push button, a 10kΩ resistor, and a
piezoelectric buzzer. The buzzer is controlled on pin 8, and the
button is attached on pin 2. The code for the board can be [downloaded
here]({{ url }}/assets/posts/20210131_FunkyDuino/funky_duino.ino)
(it's not terribly elegant!), and the following image provides the
layout:

<center>
<a href="{{ url }}/assets/posts/20210131_FunkyDuino/funky_duino.jpg"><img src="{{ url }}/assets/posts/20210131_FunkyDuino/funky_duino.jpg" height="400px"/></a>
</center>
