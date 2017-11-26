---
layout: post
title:  "Predicting growth in children - part 2/2"
categories: kaggle scikit
permalink: eci2/
controller: Eci2Controller

---

<!-- /_sass/minima/_layout -->



In the [previous post](http://dev.null.com.ar/eci){:target="_blank"} I talked about a Kaggle competition in which we had to build a model to predict certain factors that affect children's health in Argentina. I wrote about some exploratory analysis on the problem and today I continue with those ideas, now applied to a model.

<!-- - cada uno de los diferentes datasets -->
## Datasets

In the last episode (?), we saw we have some kind of "history" on each patient: we have some rows corresponding to different checkups for the same patient. Now we can try to build another dataset that takes advantage of this "patient history".

On the training set, we have some patients with four check-ups and the rest have only three check-ups. For those with only three measurements, the fourth one is included in the test set. So, in the end, we can have four rows for every patient. What I did was to concatenate together all the check-ups for the same patients into one row each.

Now we have a dataset made of a history of four check-ups per row.

{% include image.html id='concat' url='/assets/eci/concat3.png' description='Concatenating rows' %}

For example, given one patient, I can concatenate all four check-ups into only one row. The clear advantage of this is that I have way more information on the patient on each row: all the HAZs. WAZs, BMIZs, etc into one row. On the other hand, this means that now I have a much smaller train set, **6200**~ versus the original **42000**~.

Another thing I can do is to concatenate three checkups per row instead of all four as in the image.
This implies that I can now use the first and last three rows of the patients and make two different rows. With this approach I have twice as much training rows, **12000**~.

I also kept the original dataset to use for training. I think it can't hurt to train a separate model with it.

From now on I'll name these datasets: <u>4-dataset</u>, <u>3-dataset</u> and <u>original dataset</u> respectively.

{% include image-group.html images=site.data.eci2_datasets lang='en' %}


Those are the main three datasets I used in my final solution, but on the journey I made a lot more of <span style="font-size: xx-small;">(failed)</span> experiments.

Now is also time to add some more work to our pipeline (remember we had a end to end pipeline from the last post). With scikit-learn we can automatically divide the train datasets into three parts: train/test/validation. This will become super handy because we leave the original test set untouched, meaning that we won't overfit to the test data.

Another basic thing is to have a cross validation method (also coming almost for free in scikit) to check for an estimation of our score locally.

I ran each dataset on our basic pipeline one at a time, and submitting the solution for the 4-dataset resulted in a score of **0.785**. The last score was  **0.77043** so this is a nice improvement!

<!-- - feaures engs que se hicieron -->

## Pulling features out of my hat

Ok, we have our pipeline working, explored our data, made maps and created new datasets. Now what?
We can start looking into making new features and transforming the existing ones into a better representation for the classifier.

The features I'll end up adding are based on the map data we talked about in the [last post](http://dev.null.com.ar){:target="_blank"}, combinations of the original features and insights from other studies on the same subject. Some of these worked flawlessly and others were terrible.

Let's start with the map data we talk about earlier. I used what I saw that time on the map to clusterize "by hand" the hospitals and ended up making fourteen different regions.

{% include image.html id='regiones' url='/assets/eci/regiones.png' description='Regions selected by hand' %}

It was a promising idea but sadly it didn't work at all. The gradient boosting method I'm using as model, let's you look at which features were more important at the moment of taking a decision. This new clusterization ended up not being important at all.

On the other hand, another approach consisting on having the proportion of "decae" = true/false for each hospital was surprisingly good. This feature improved the overall score.

In the 4-dataset, I had four instances of HAZ, WAZ and BMIZ over time. I wanted to use this information, and to let know the classifier that they are related somehow. I came up with a function that, for each row, adjusts a linear regression over these four values and adds the slope and intercept of the fitted line as new features.

$$ y_i = \alpha_1 HAZ_1 + \alpha_2 HAZ_2 +\alpha_3 HAZ_3 +\alpha_4 HAZ_4 + \beta $$


<div style="text-align:center">
<span>
$$ \rightarrow \text{new features for this row:  }\; \alpha, \; \beta $$
</span>
</div>

Here you can play a bit with some of the results:


<div class="row" style=" margin-bottom:20px;   border: 2px solid; border-radius: 20px; justify-content: center; display: flex; padding: 10px;">
<div class="col-md-8">

<div id="lr_chart">
</div>
</div>

<div class="col-md-3" style="    display: grid; height: 200px; align-items: center; margin-top: 100px; text-indent: 0; text-align: center; ">

<h4 class="bold">Patient ID: [[{curr+1}]]</h4>
<h4 class="bold">Decae:
<span ng-if="datasets[curr][12] == 'True'" style="color: red;">[[{datasets[curr][12]}]]</span>
<span ng-if="datasets[curr][12] != 'True'" style="color: blue;">[[{datasets[curr][12]}]]</span>
</h4>

<button class="btn btn-primary glyphicon glyphicon-chevron-left" ng-click="prev()" ng-disabled="curr==0"></button>
<button class="btn glyphicon glyphicon-zoom-in" ng-click="zoom()" ></button>
<button class="btn btn-primary glyphicon glyphicon-chevron-right" ng-click="next()" ng-disabled="curr==datasets.length-1"></button>
</div>
</div>


I also added second grade polynomic features based on HAZ, WAZ and BMIZ. This means to take each of the features and multiply them by all others (including itself).
In my particular case, in the 4-dataset for example, I took HAZ_1, ..., HAZ_4 and combined them into the following features:

{::options parse_block_html="true" /}
<div style="display: block; text-align: center">


$${haz}\color{red}{\mathbf{1}} * {haz}\color{red}{\mathbf{1}}$$ $$\qquad{haz}\color{red}{\mathbf{1}} * {haz}\color{red}{\mathbf{2}}$$ $$\qquad{haz}\color{red}{\mathbf{1}} * {haz}\color{red}{\mathbf{3}}$$ $$\qquad{haz}\color{red}{\mathbf{1}} * {haz}\color{red}{\mathbf{4}}$$

$${haz}\color{red}{\mathbf{2}} * {haz}\color{red}{\mathbf{2}}$$ $$\qquad{haz}\color{red}{\mathbf{2}} * {haz}\color{red}{\mathbf{3}}$$ $$\qquad{haz}\color{red}{\mathbf{2}} * {haz}\color{red}{\mathbf{4}}$$

$${haz}\color{red}{\mathbf{3}} * {haz}\color{red}{\mathbf{3}}$$ $$\qquad{haz}\color{red}{\mathbf{3}} * {haz}\color{red}{\mathbf{4}}$$

$$$$$${haz}\color{red}{\mathbf{4}} * {haz}\color{red}{\mathbf{4}}$$


</div>

The same process was applied to WAZ_1...WAZ_4 and BMIZ_4...BMIZ_4. This added 30 new features in total.

The problem we're studing, the one of children growth, must be a common one and other articles and papers *must* exist on the subject.
In fact there're a lot. [This one](https://www.omicsonline.org/open-access/predicting-under-nutrition-status-of-under-five-children-using-data-mining-techniques-2157-7420.1000152.pdf){:target="_blank"} in particular caught my attention because it tries to solve a very very similar problem on children in Ethiopia. I took a result from that paper: a rule that stated that an individual is malnourished if

<p style="text-align:center">
$$haz \leq 2\sigma \quad$$  and  $$\quad -2\sigma \leq waz \leq 2\sigma$$
</p>

with $$\sigma$$ the standard deviation.

They claim this rule alone classified correctly 99.7% of their instances (!). This seems like magic, so why not? Let's try it.
I adjusted a bit those values and created a feature based on the rule which, out of lack of a better name, I called it "Magic".
It ended up as one of the most important features in my model.

<div class="waka tabla" style="font-size: 14px">

|Name| Description |
|-------|--------|
| region_n | 1 if the hospital belongs to region $$n$$, 0 if not. |
| p | proportion of decae=true for the hospital  |
| HAZ_x * HAZ_y | Polynomical features for HAZ|
| WAZ_x * WAZ_y |  Polynomical features for WAZ |
| BMIZ_x * BMIZ_y |  Polynomical features for BMIZ |
|HAZ/WAZ/BMIZ_x_linear_reg_slope| Slope of the regression line for HAZ/WAZ/BMIZ|
|HAZ/WAZ/BMIZ_x_linear_reg_intercept|Intercept of the regression line for HAZ/WAZ/BMIZ|
| magic | $$haz \leq 2\sigma \quad$$  and  $$\quad -2\sigma \leq waz \leq 2\sigma$$ |

</div>

## Combining everything
<!-- - stacking -->
Until now, I've been running each of these datasets separately and submitting those solutions. One idea in machine learning that works very well is to "combine" several models into a better model. There are different approaches to do this like boosting, bagging and stacking.
Our base model, Gradint Boosting, already uses this idea by having an ensamble of trees internally.

To combine my models I used stacking. This means making a new dataset from the solutions of other models, and running another classifier on top of that.

{% include image-group.html images=site.data.eci2 lang='en' %}

<!-- - modelo y puntaje final -->
So what I'm combining here? Like I said, I've been running each of the datasets described with a simple gradient boosting algorithm. What I'll do is to get all those predictions and make a new dataset with each prediction as a feature column and I'll run a prediction algorithm on that to get the final result.

So, I've described three datasets until now: 4-dataset, 3-dataset and the original one. But I can play a little more with this. Let's remember our target variable definition:


<div class="tabla" style="margin-bottom:20px">
<table >
<tr style="background-color:#C5CAE9 !important">
<td>Decae (Target variable) </td>
<td>
It takes the value "True" if at least one of the following conditions occurs:
<div style="margin: auto;  display: table;">
<div style="vertical-align: middle;font-size: 70px;margin-top: 22px;">
{
</div>
<div class="" style="font-family: monospace;display: table-cell;vertical-align: middle;">
<div class="">
<span>HAZ &gt;= -1 and next_HAZ &lt; -1</span>
</div>
<div class="">
<span>WAZ &gt;= -1 and next_WAZ &lt; -1</span>
</div>
<div class="">
<span>BMIZ &gt;= -1 and next_BMIZ &lt; -1</span>
</div>
</div>
</div>
</td>
</tr>
</table>
</div>

Ok, we can see that everything depends on the value of the previous check-up: if HAZ/WAZ/BMIZ was below -1 (the first part of the condition), "decae:" will always be false regardeless of the value of the next check-up. This is very restrictive and probably confuses our algorithm.

What happens if I remove this restriction? For each of my datasets I made *another one* where the target variable doesn't have this condition. This means that "decae" will be independent of previous values, it will only depend on the new checkup. I had three datasets and duplicated them so now I have $$3 * 2 = 6$$ datasets.

Going further, I made other datasets but instead of removing the restriction for all variables, I removed it for one variable at a time. For example, a made a new data set removing the restriction on HAZ but keeping WAZ and BMIZ untouched. That's three more datasets for each one of the originals: $$3 * 2 + 3 * 3 = 15$$.

One last idea, I can try to predict our target variable using only one column of the original dataset at a time. For example, trying to predict "decae" only by looking at the date of birth, then by looking only at the region, etc. Each of these predictions by themselves is very bad, but I combined the results into a new dataset, having *each prediction as a feature column*. Yes, it's the stacking idea again, I made a smaller stacked model to use on our final bigger stacking model.

This brings the total to sixteen different models. Like I said before, I put each of the individual predictions of each of the sixteen datasets as columns of a new final dataset and predicted that set with yet another model (that ended up being gradient boosting again, but with other hyperparameters).

This seventeenth model was my final one.

## Adjusting knobs

Finally, let's improve and optimize everything. I have seventeen models made of Gradient Boosting with default parameters.
This algorithm has several hyperparameters to play with and I think this is the right time to start with this task. I have the impression that it's common (and I did it myself in the past) to start adjusting the parameters very early when working on a project, even after having an end-to-end pipeline working (I talked a bit about this [earlier](http://dev.null.com.ar/eci){:target="_blank"}). The problem with this is that you can waste a lot of time trying to improve something that will change
pretty soon. So, I like to have a solid and well thought solution before start optimizing.

Finding hyperparameters is basically an automated process. Scikit has methods like GridSearchCV or RandomizedSearchCV. The former searches all the combinations of the parameters that you want, performing a Cross Validation using your model and reports the best set of parameters that it found. It is slooooow.

The latter doesn't try everything, you have to specify how many times you want the algorithm to run and it chooses a random subset of your parameters each round. It is way faster but I don't find it good enough.

I came up with a custom method that worked for me. I don't know if it is something that already exists and I just reinvented the wheel or something. Or maybe is just a bad idea overall and I just got lucky this time. My method is a greedy search over the space of hyperparameters:

1. For each parameter, I assign a set of possible values
2. I take one parameter randomly
3. I try all values assigned to that parameter and keep the one that got the best score
4. I continue from (2) having that parameter fixed

I run this $$n$$ times and I keep the best generated model. Yes, I know, it is shady at least but in practice it did work for me and was very very fast (if I'm not mistaken, $$O(n)$$ for n being the total number of values I can try for the hyperparameters).

I ran this until I felt the results were good enough and then submitted.

My previous score was **0.785** and my final score...* *drumroll* *.... **0.78998**.

## Conclusion

I finished the competition 18th of 40 participants. It's not the position I'd liked, but it's ok and I learned a lot along the way:

* Having a pipeline end to end as a first priority is good. But after that, I would have wanted to give a better look at the data. For example, next time I'll try to classify by hand some examples to see if I can discover a pattern or take a look to the more extreme cases of each class. The brain is more powerful than any algorithmic predictor.

* I can reuse my code for another competition, I think at least the structure is usable and I'll save a lot of time.

* Model stacking works well, but I had a hard time coding it. Next time I'll think my code better knowing that I'll have to use my results for a stacked model.

* Finally, I have my not-so-scientifically-probed-but-good-in-practice-greedy-cross-validation method that helped me this time. It may not be the best alternative, but I kinda grew fond of it.

<!-- - conclusion de la historia -->

The interesting thing about this problem is that these results (and others by other participants) can be really useful in public health.
With more information, like for example data about the mothers, we'll surely can get a better score and better predictions.


It would be awesome if something like this ends up being used by doctors and help children before they even start having some kind of problem.

{::options parse_block_html="true" /}
<div style="float:right;padding: 50px; padding-bottom: 70px;">
*That's all, thanks for reading!*
</div>
