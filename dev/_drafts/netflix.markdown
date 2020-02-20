---
layout: post
title:  "The best movies on Netflix"
categories: python
permalink: netflix/
---

<!-- /_sass/minima/_layout -->

My mother loves Netflix. In fact, it's her favorite source for movies and shows. But she has a issue I bet most of us had: we don't know what to watch next. Ok, Netflix has its recommendation system, but (at least for me) it is not working as I would like.

So she just searches aimlessly and picks a movie, but sometimes it's  a bad movie (and it's not that there's something wrong with my mother's preferences in movies or something like that). On top of that, Netflix also recommends movies that are not that good, or not at all. So, we all have gone more or less through the same. I came with a simple solution that I want to share, a list of the best-rated movies in Netflix Argentina (link at the bottom).


Let's assess the situation. Netflix has different movies for each region. In Argentina, there are fewer movies than we'd like. Sometimes we search on the internet for new movies or for recommended movies but it's possible that they aren't in our region. Nevertheless, Netflix has good movies that are there to find and of course a lot of original productions. At the time of writing, there isn't a proper score for the movies, all I can see is a 'match' percentage, that I assume is how much would I like the movie based on what I watched earlier. But I don't see any information about how much the movie is liked by others. I know that sites like IMDB (Internet Movie Database) or Rotten Tomatoes have all these movies scored by critics and the public, and they're more or less accurate. If a movie is well rated there, I tend to like it. So that's a good place to start, we can build something that relates movies to scores and keep only the 'good' ones.


We got some problems to solve first. We need to get all the movies from Netflix, but it doesn't have an API. It had it before but now it's deprecated.

On the other hand, we have the movie scores. To get these scores I've chosen to use only IMDB. It has an API so we should be good. The last thing to do is to merge all that information.


For the IMDB part, I used an open service: [OMDb](http://www.omdbapi.com){:target="_blank"}. It lets me query a thousand movies per day. I need to query for the movies in English, so I changed my Netflix account to English. To get the movies for Netflix I did something I'm not so proud of. When you enter the movies tab, you see some movies, and it has an infinite scroll to show the others. So... I scrolled all the way down to load all the movies' names. Then I just copied and parsed the resulting HTML.
With this, I got more or less 1700 movies.

OMDb lets you query the API a thousand times a day but I didn't want to get info for a thousand movies and wait another day for the rest. So, yes, I created two accounts and used them at the same time. Using this I got a list of movies with ratings and genres. I filtered all movies with a score lower than 6.
The list is sorted lexicographically but this order isn't the best because we have the good movies mixed with the so-so ones. We have to sort this list differently somehow. If I sort only by the score, I get movies that we all saw like The Godfather II or Schindler's List. So I sorted it by year and score, newer movies first. In fact, I made groups of three or four consecutive years each and sorted by that. In the end you have the best recent movies, followed by the best from 2015-16 and so on.


In the end, I got a list of 654 movies from Netflix Argentina rated 6.0 or more by IMDb. The final file is here: [Netflix List](http://dev.null.com.ar/netflix.csv)
