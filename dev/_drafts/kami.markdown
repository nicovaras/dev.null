---
layout: post
title:  "Solving the Android game Kami"
categories: python ai
permalink: kami/
controller: Eci2Controller

---

<!-- /_sass/minima/_layout -->


<!-- historia -->
The other day I was bored so I did what everyone do when they're bored: I went for my phone and searched for a new game.
I found this game, [Kami 2]. It's a very relaxing and pleasant puzzle game and I finished quite a few levels. But, like every game of this style, the levels were getting harder and it can give you clues but for a price. So I thought what everyone think at this time but nobody say: how can I cheat?

Today I show you a way to have a little "extra help" with this game, it's something similar to what a did in a [previous post] and can be still extended to other games.

## The Game
<!-- explicacion del juego -->

First of all, a [video](https://www.youtube.com/watch?v=yiK8EqCvtkI){:target="_blank"} may be better than any explanation I can give.

I present you the particular level I'll be using throughout the post.

FOTO

The objective of the game is to paint each cell to end up with only one color at the end

FOTO --> FOTO FIN

To do this we tap a color from the bottom and then a cell. That cell and every other adjacent cell with the same color will be painted with the new color

FOTO --> FOTO pintado

You have to do this in less than X movements and that's it, those are the rules.

<!-- explicacion de la solucion focusing en el porque -->
## The Idea

I want to solve this automatically, so, what can I do?

One naive solution would be a program that tries every color in every cell until it reaches a solution. Well... if it works, it works, let's go with that.

It would be very slow if I make a program that really taps on the screen and really plays the game, so I'll have a representation of the game and have a python script to solve it.

Having group of cells adjacent to each other seems like a graph, in particular we can abstract our level to:

FOTO GRAFO

If the python script can have this representation, it can solve it trying every possibility like we said before.

To reach that point we need to:

* Capture a snapshot of the level
* Identify each cell and which neighbours it has (making a graph)
* Identify each cell color
* Use backtracking to solve that graph and reach a solution

## The Solution
<!-- paso a paso con dibujitos y codigo -->
To start I just took a screenshot of the level with my phone. I could automate this first step, but I'll leave it for the future.

FOTO

Now I import it in python and I have to identify each cell color. I'm using the image library [pillow] for this.

To be able to recognize each cell's color, first I have to know where each cell is. This can be done easily with a couple of for loops and calculating correctly the separation between each cell.

FOTO crosss

In this step I can also start making the graph, it is straightforward to do this.

Foto graph

Then I read each color from the bottom of the screen and the color of each cell. I can compare them directly because the colors aren't uniform, so I took an average from the surrouding pixels and took the closest matching color. This worked flawlessly.

Foto colors

Ok, from this representation I can solve it

<!-- fin historia -->

{::options parse_block_html="true" /}
<div style="float:right;padding: 50px; padding-bottom: 70px;">
*That's all, thanks for reading!*
</div>
