---
layout: post
title:  "Predicting growth in children - part 2/2"
categories: kaggle scikit
permalink: eci2/
controller: Eci2Controller

---

<!-- /_sass/minima/_layout -->

<div class="row">
<div class="col-md-9">

<div id="lr_chart">
</div>
</div>

<div class="col-md-3">

<button ng-click="prev()" ng-disabled="curr==0">a</button>
<button ng-click="next()" ng-disabled="curr==datasets.length-1">b</button>
<button ng-click="zoom()" >b</button>
<div class="bold">Patient ID: [[{curr+1}]]</div>
<div class="bold">Decae: [[{datasets[curr][12]}]]</div>
</div>
</div>

In the [previous post](http://dev.null.com.ar/eci){:target="_blank"} I talked about a Kaggle competition that proposed building a model that predicts factors that affect children's health in Argentina. I wrote about some exploratory analysis on the problem and today I continue with those ideas applied to a model.

<!-- - cada uno de los diferentes datasets -->
## Datasets

We saw we have some kind of "history" on each patient. We have four measurements corresponding to four different checkups. Now we can try to build another dataset that takes advantage of that history of the patient.

On the training set we have some patients with four measurements and the rest have only three. For those with only three measurements, the fourth one is included in the test set. What I did was to concatenate together all the checkups for the same patients into one row.
Now we have a dataset made of a history of four checkups per row.

{% include image.html id='concat' url='/assets/eci/concat3.png' description='Concatenating rows' %}

I can concatenate for example all four check-ups into one row. The clear advantage is that I have way more information on the patient on each row but on the other hand now I have a much smaller train set, **6200**~ versus the original **42000**~.

Another thing I can do is to concatenate three checkups per row instead of all four.
This implies that I can now use the first and last three rows of the patients and make two different rows. With this approach I have twice as much training rows, **12000**~.

I also kept the original dataset to use for training. I think it can't hurt to train a separate model with it.

Those are the main three datasets I used in my final solution, but on the journey I made a lot more of <span style="font-size: xx-small;">(failed)</span> experiments.

Now is also time to add some more work to the pipeline. With scikit-learn we can automatically divide the train datasets into three parts: train/test/validation. This will became super handy because we leave the original test set untouched, meaning that we won't overfit to the test data.

Another basic thing is to have a cross validation method (also coming almost for free in scikit) to check for an estimation of our score locally.

From now on I'll name these datasets: <u>4-dataset</u>, <u>3-dataset</u> and <u>original dataset</u> respectibily.

Running the 4-dataset on our basic pipeline and submitting the solution resulted in a score of **0.785**. The last score was  **0.77043** so this is a nice improvement!

<!-- - feaures engs que se hicieron -->

## Pulling features out of my hat

Ok, we have our pipeline working, explored our data, made maps and created new datasets. Now what?
We can start looking into making new features and transforming the existing ones into a better representation for the classifier.

The features I'll end up adding are based on the map data we talked about in the [last post](http://dev.null.com.ar){:target="_blank"}, combinations of the original features and insights from other studies on the same subject. Some of these worked flawlessly and others were terrible.

Let's start with the map data we talk about earlier. I used what I saw in the map to clusterize "by hand" the hospitals and made 14 different regions.

{% include image.html id='regiones' url='/assets/eci/regiones.png' description='Regions selected by hand' %}

It was a promising idea but sadly it didn't work at all. The gradient boosting method I'm using as model, let's you look at which features were more important at the moment of taking a decision. This new clusterization ended up not being important at all.

On the other hand, an approach of having the proportion of "decae" = true/false for each hospital was surprisingly good. This feature improved the overall score.

In the 4-dataset, I had four instances of HAZ, WAZ and BMIZ over time. I wanted to use this information, and to let know the classifier that they are related somehow. I came up with a function that, for each row, adjusts a linear regression over these four values and adds the slope and intercept of the fitted line as new features.

$$ y_i = \alpha_1 HAZ_1 + \alpha_2 HAZ_2 +\alpha_3 HAZ_3 +\alpha_4 HAZ_4 + \beta $$

<div style="text-align:center">
<span>
$$ \rightarrow \text{new features for this row:  }\; \alpha, \; \beta $$
</span>
</div>

////GRAFICO INTERACTIVO lr

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
Until now I've been running each dataset an change separately and submitting those solutions. One idea in machine learning that works very well is to "combine" several models into a better model. There are different approaches to do this like boosting, bagging and stacking.
Our base model, Gradint Boosting, already uses this idea by having an ensamble of trees internally.

For my models I used stacking. This means making a new dataset from the solutions of other models, and running another classifier on top of that.

{% include image-group.html images=site.data.eci2 lang='en' %}

<!-- - modelo y puntaje final -->
So what I'm combining here? I've been running each of the datasets described with a simple gradient boosting algorithm. What I'll do is to get all those predictions and make a new dataset with each prediction as a feature column and I'll run a prediction algorithm on that to get the final result.

I've described three datasets until now: 4-dataset, 3-dataset and the original one. But I can play a little more with this, let's remember our target variable definition:


<div class="tabla" >
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

Ok, we can see that everything depends on the value of the previous checkup: if HAZ/WAZ/BMIZ was below -1, my condition will always be false regardeless of the value of the new checkup.

What happens if I remove this restriction? For each of my datasets I made another one where the target variable doesn't have this condition. This means that "decae" will be independent of previous values, it will only depend on the new checkup. Now I have $$3 * 2 = 6$$ datasets.

Going further, I made other datasets but instead of removing the restriction for all variables, I removed it for one variable at a time. For example, a made a new data set removing the condition on HAZ but keeping WAZ and BMIZ untouched. That's three more datasets for each one of the originals: $$3 * 2 + 3 * 3 = 15$$.

One last idea, I can try to predict our target variable using only one column of the original dataset at a time. For example, trying to predict "decae" only by looking at the date of birth. Each of these predictions by themselves are very bad, but I combined the results into a new dataset, having each prediction as a feature column (yes, it is stacking again, I made a lesser stacked model to use on our final stacking model).

This brings the total to sixteen different models. Like I said before, I put each of the individual predictions of each of the sixteen datasets as columns and predicted that final set with yet another model (that ended up being gradient boosting again, but with other parameters).

This seventeenth model was my final one.

## Adjusting knobs

Finally, let's improve and optimize everything. I have seventeen models made of Gradient Boosting with default parameters.
This algorithm has several hyperparameters to play with and I think this is the right time to start with this task. I think is common (and I did it myself in the past) to start adjusting the parameters very early when working on a project, even after having an end-to-end pipeline working (I talked a bit about this [earlier](http://dev.null.com.ar/eci){:target="_blank"}). The problem with this is that you can lose a lot of time trying to improve something that will change
pretty soon. So, I like to have a solid and well thought solution before starting optimizing.

Finding hyperparameters is basically an automated process. Scikit has methods like GridSearchCV or RandomizedSearchCV. The former searches all the combinations of the parameters that you want, performing a Cross Validation using your model and reports the best set of parameters that it found. It is slooooow. The latter doesn't try everything, you have to specify how many times you want the algorithm to run and it chooses a random subset of your parameters each round. It is way faster but I don't find it good enough.

I came up with a custom method that worked for me. I don't know if it is something that already exists and I just reinvented the wheel or something. Or maybe is just a bad idea overall and I just got lucky this time. My method is a greedy search over the space of hyperparameters:

1. I take one parameter randomly
2. I try all values assigned to that parameter and keep the one that got the best score
3. I fix that parameter and repeat from (1)

I run this $$n$$ times and I keep the best model generated. Yes, I know, it is shady at least but in practice it did work for me and was very very fast (if I'm not mistaken, $$O(n)$$ for n being the total number of values I can try for the hyperparameters).

I ran this until I felt the results were good enough and then submitted.

My previous score was **0.785** and my final score...* *drumroll* *.... **0.78998**.

## Conclusion

I ended up 18th of 40 participants. It's not the position I'd wanted, but it's ok and I learned a lot along the way:

* Having a pipeline end to end as a first priority is good. But after that, I would have wanted to give a better look at the data. For example, next time I'll try to classify by hand some examples to see if I can discover a pattern or take a look to the more extreme cases of each class.

* I can reuse my code for another competition, I think at least the structure is usable and I'll save a lot of time.

* The stacking of models works well, but I had a hard time coding it. Next time I'll think my code better knowing that I'll have to use my results for a stacked model.

* Finally, I have my not-so-scientifically-probed-but-good-in-practice greedy cross validation method that helped me this time. It may not be the best alternative, but I kinda grew fond of it.

<!-- - conclusion de la historia -->

The interesting thing about this problem is that these results (and others by other participants) can be really useful in public health.
With more information, like for example data about the mothers, we'll surely can a better score and better predictions.
It would be awesome if something like this ends up being used by doctors and help children before they even start having some kind of problem.

{::options parse_block_html="true" /}
<div style="float:right;padding: 50px; padding-bottom: 70px;">
*That's all, thanks for reading!*
</div>
