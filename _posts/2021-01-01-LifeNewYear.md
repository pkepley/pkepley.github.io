---
layout: post
published: true
title: Life in the New Year
tag: [D3, Banjo, Audio]
---

Five years ago, [I spent New Year's
eve](https://www.youtube.com/watch?v=mAHxzNBV960) playing around with
a naive implementation of [Conway's Game of
Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) in Python
and finishing off a bottle of wine. Although there's something kind of
natural about reflecting on "Life" as a year ends, this year's [Advent
of Code](https://adventofcode.com/) helped prime me into think about
it, since the problems for days
[11](https://adventofcode.com/2020/day/11),
[17](https://adventofcode.com/2020/day/17), and
[24](https://adventofcode.com/2020/day/24) all considered finite state
automata with Life-eqsue rules. Also, I'm not the only one who was
[thinking about Life
recently](https://www.nytimes.com/2020/12/28/science/math-conway-game-of-life.html),
probably because John Conway [passed away this past
April](https://www.nytimes.com/2020/04/15/technology/john-horton-conway-dead-coronavirus.html)
due to the coronavirus.

Anyhow, I just wanted to make a quick post to mark the new year, with
a slightly more efficient in-browser implementation of Life
(i.e. updates computed in $$\mathcal{O}(n_\text{alive})$$ operations,
as opposed to the lazy $$\mathcal{O}(n_\text{rows}^2)$$ version that I
used 5 years ago). So without further ado/explanation, here's Life on
a finite grid with periodic boundary conditions:

[comment]: <> assign path for assets to avoid repeating myself
{% assign asset_path = base | append: "/assets/posts/20210101_Life" %}
[comment]: <> content begins below

<center>
	<div class="svg-container"></div>
</center>

<link rel="stylesheet" type="text/css" href="{{ asset_path }}/life_display.css"/>
<script src="{{ url }}/assets/posts/js/d3.v5.min.js"></script>
<script src="{{ asset_path }}/life_display.js"></script>

## Banjo Auld-Lang Syne 🪕
On a completely unrelated note, before we went out for New Year's last
year, I spent some time trying to pick out Auld Lang Syne on my
banjo. I didn't manage to get it quite right at the time (and it's not
the kind of song you'd think to mess around with except around New
Year's) so I just kind of left it at that. However, in the spirit of
starting out the New Year by reflecting on old projects, I sat down
this year and hammered out something a bit more reasonable:

<audio controls id="banjo_auld_lang_syne" preload="auto">
	<source src="{{ asset_path }}/banjo_auld_lang_syne_ish.mp3" type="audio/ogg"/>
	Your browser does not support the <code>audio</code> element.
</audio>
