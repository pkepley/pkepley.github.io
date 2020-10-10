---
layout: default
title: Posts by Tag
---

<header class="tags-header">
  <h1 class="tags-title" itemprop="name headline">{{ page.title | escape }}</h1>
</header>

<div class="tags-expo">
  <h2> Tags </h2>
  <div class="tags-expo-list">
    {% for tag in site.tags %}
	  {% assign tag_pretty = tag[0] | slugify | capitalize %}	
	  {% if forloop.index > 1 %}|{% endif %}
      <a href="#{{ tag_pretty }}" class="post-tag">{{ tag_pretty }}</a>
    {% endfor %}
  </div>
  <hr/>
  <div class="tags-expo-section">
    {% for tag in site.tags %}
	{% assign tag_pretty = tag[0] | slugify | capitalize %}
    <h2 id="{{ tag_pretty }}"> {{ tag_pretty }}</h2>
    <ul class="tags-expo-posts">
      {% for post in tag[1] %}
      <li>
        <a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a>&nbsp;{{ post.date | date_to_string }}
      </li>
      {% endfor %}
    </ul>
    {% endfor %}
  </div>
</div>
