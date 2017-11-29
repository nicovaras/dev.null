---
layout: post
title:  "Solving the Android game Kami"
categories: python ai
permalink: kami/
controller: Eci2Controller
reading: 5
class: kami

---

<!-- /_sass/minima/_layout -->


<!-- historia -->
The other day I was bored so I did what everyone do when they're bored: I went for my phone and searched for a new game.
I found this game, [Kami 2](https://play.google.com/store/apps/details?id=com.stateofplaygames.kami2){:target="_blank"}. It's a very relaxing and pleasant puzzle game and I finished quite a few levels. But, like every game of this style, the levels were getting harder and it can give you clues but for a price. So I thought what everyone think at this time but nobody say: how can I cheat?

Today I show you a way to have a little "extra help" with this game, it's something similar to what a did in a [previous post](http://127.0.0.1:4000/ai/){:target="_blank"} with a game called Hitori and can be still extended to other games.

## The Game
<!-- explicacion del juego -->

First of all, a [video](https://www.youtube.com/watch?v=yiK8EqCvtkI){:target="_blank"} may be better than any explanation I could give.

I present you the particular level I'll be using throughout the post.

{% include image.html class="kami-small" url="/assets/kami/test.jpg" description="Our test case" %}

The objective of the game is to paint each cell to end up with only one color at the end

{% include image-group.html arrow='true' class="kami-small" images=site.data.kami_fin lang='en' %}

To do this we tap a color from the bottom and then a cell. That cell and every other adjacent cell with the same color will be painted with the new color

{% include image-group.html arrow='true' class="kami-small" images=site.data.kami_color lang='en' %}

You have to do this in less than X movements and that's it, those are the rules.

<!-- explicacion de la solucion focusing en el porque -->
## The Idea

I want to solve this automatically, so, what can I do?

One naive solution would be a program that tries every color in every cell until it reaches a solution. Well... if it works, it works, let's go with that.

It would be very slow if I make a program that really taps on the screen and really plays the game, so I'll have a representation of the game and have a python script to solve it.

Having group of cells adjacent to each other seems like a graph, in particular we can abstract our level to:

{% include image.html url="/assets/kami/graphviz.png" description="Simplified graph representation" %}

If the python script can have this representation, it can solve it trying every possibility like we said before.

To reach that point we need to:

* Capture a snapshot of the level
* Identify each cell and which neighbours it has (making a graph)
* Identify each cell color
* Use backtracking to solve that graph and reach a solution

## The Solution
<!-- paso a paso con dibujitos y codigo -->

For this script and all image processing I'm using the image library [pillow](https://python-pillow.org/){:target="_blank"}.

{% include image_inline.html  url="/assets/kami/test.jpg" description="Our test case again, the screeshot I took"
text="To start I just took a screenshot of the level with my phone. I could automate this first step, but I'll leave it for the future." %}


{% include image_inline.html url="/assets/kami/cross.jpg" description="Every cell recognized" order=1
text="To be able to recognize each cell's color, first I have to know where each cell is. This can be done easily with a couple of for loops and calculating correctly the separation between each cell." %}

{% include image_inline.html url="/assets/kami/graph.jpg" description="Every cell connected in a graph"
text="In this step I can also start making the graph, it is straightforward to do this." %}

{% include image_inline.html url="/assets/kami/colors.jpg" description="The colors recognized" order=1
text="
Then I read each color from the bottom of the screen and the color of each cell. I can compare them directly because the colors aren't uniform, so I took an average from the surrouding pixels and took the closest matching color. This worked flawlessly." %}

Ok, from this representation we can already solve it. Only theoretically. The problem is that we have way too many nodes and we're using backtracking, this will not finish in a reasonable time (it doesn't, I tried).

We can give it another go. It's really the same if I tap a cell from a sector or other cell from the same sector, so we can group or 'clusterize' our graph.

{% include image_inline.html url="/assets/kami/clusters.jpg" description="Each cluster recognized separately"
text=" Having a clusterized version of the graph means that now we have only one node per cluster instead that one node per cell. We've reduced the number of nodes drastically." %}

{% include image_inline.html url="/assets/kami/sol1.jpg" description="The solution to this puzzle" order=1
text="Now our backtracking algorithm can finish in our lifespan and it gives us the solution for the puzzle! (magic!). You can click the image
to see the solution better. Each number represents the order in which to click (strating from zero) and which color to choose" %}


## The Next Steps

Ok, so we have a working script that solves this puzzle. The manual labor consists in taking a screenshot of the level and running the script. Here are a couple more of solutions:

{% include image-group.html  class="kami-small" images=site.data.kami_sols lang='en' %}

So it is solved. Only theoretically... again. I had to keep the script running all night for that last gray and yellow puzzle. Backtracking isn't the real anwser here. In the future it could be cool if I change the solver from backtracking to something a bit more smart like A* and integrate everything to android.

The code for this script can be found [here](https://github.com/nicovaras/ia_experiments/tree/master/kami){:target="_blank"}

Oh well, meanwhile I'll try not to cheat anymore and enjoy the game (and you should too, it's very good!).



<!-- fin historia -->

{::options parse_block_html="true" /}
<div style="float:right;padding: 50px; padding-bottom: 70px;">
*That's all, thanks for reading!*
</div>
