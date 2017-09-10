---
layout: post
title:  "Predicting growth in children - part 2/2"
categories: kaggle scikit
permalink: eci2/
---

<!-- /_sass/minima/_layout -->

In the [previous post](http://dev.null.com.ar/eci) I talked about a Kaggle competition that proposed building a model that predicts factors that affect children's health in Argentina. I wrote about some exploratory analysis on the problem and today I continue with those ideas applied to a model.

<!-- - cada uno de los diferentes datasets -->
# Datasets

We saw we have some kind of "history" on each patient. We have four measurements corresponding to four different checkups. Now we can try to build another dataset that takes advantage of that history of the patient.
On the training set we have some patients with four measurements and the rest have only three. The fourth one is in the test set.
What I did was to concatenate together all the three or four measurement rows for each patient into only one row. For the patients with three rows in the training set, I concatenated them with the corresponding row of the test set and made my new test set from that. Now we have a dataset made of a history of four checkups per row.
The clear advantage is that I have way more information on the patient on each row but on the other hand now I have a much smaller train set, 6200~ versus the original 42000~.

// dibujito de concatenar 4

Another thing I did was to make a dataset of three checkups per row instead of all four.
This implies that I can now use the first three rows of the test subjects and use them in my training set. With this approach I have twice as much training rows, 12000~.

// dibujito de concatenar 3

I also kept the original dataset to use for training. I think it can't hurt to train a separate model with it.

Those are the main three datasets I used in my final solution, but on the journey I made a lot more of (failed) experiments.

Now is also time to add some more work to the pipeline. With scikit-learn we can automatically divide the train datasets into three parts: train/test/validation. This will became super handy because we leave the original test set untouched, meaning that we won't overfit to the test data.

Another basic thing is to have a cross validation method (also coming almost for free in scikit) to check for an estimation of our score locally.

From now on I'll name these datasets: 4-dataset, 3-dataset and original dataset respectibily.

Running the 4-dataset on our basic pipeline and submitting the solution resulted in a score of *0.785*. The last score was  *0.77043* so this is a nice improvement!

<!-- - feaures engs que se hicieron -->

# Pulling features out of my hat

Ok, we have our pipeline working, explored our data, made maps and created new datasets. Now what?
We can start looking into making new features and transforming the existing ones into a better representation for the classifier.

The features I'll end up adding are based on the map data we talked about in the [last post](http://dev.null.com.ar), combinations of the original features and insights from other studies on the same subject. Some of these worked flawlessly and others were terrible.

Let's start with the map data we talk about earlier. I used what I saw in the map to clusterize "by hand" the hospitals and made 14 different regions.

//mapa regiones

It was a promising idea but sadly it didn't work at all. The gradient boosting method I'm using as model, lets you look at which features were more important at the moment of taking a decision. This new clusterization ended up not being important at all.

On the other hand, the other approach of having the proportion of true/false for each hospital was surprisingly good. This feature improved the overall score.

In the 4-dataset, I had four instances of HAZ, WAZ and BMIZ over time. I wanted to use this information, and to let know the classifier that they are related somehow. I came up with a function that, for each row, adjusts a linear regression over these four values and adds the slope and intercept of the fitted line as new features.

// dibujito de LR

I also added second grade polynomic features based on HAZ, WAZ and BMIZ. This means to take each of the features and multiply them by all others (including itself).
In my particular case, in the 4-dataset for example, I took HAZ_1, ..., HAZ_4 and combined them into:

$HAZ_1 * HAZ_1$, $HAZ_1 * HAZ_2$, $HAZ_1 * HAZ_3$, $HAZ_1 * HAZ_4$, $HAZ_2 * HAZ_2$, $HAZ_2 * HAZ_3$, $HAZ_2 * HAZ_4$, $HAZ_3 * HAZ_3$, $HAZ_3 * HAZ_4$, $HAZ_4 * HAZ_4$

The same process was applied to WAZ_1...WAZ_4 and BMIZ_4...BMIZ_4. This added 30 new features in total.

The problem we're studing, the one of children growth, must be a common one and other articles and papers *must* exist on the subject.
In fact there're a lot. [This one](https://www.omicsonline.org/open-access/predicting-under-nutrition-status-of-under-five-children-using-data-mining-techniques-2157-7420.1000152.pdf) in particular caught my attention because it tries to solve a very very similar problem on children in Ethiopia. I took a result from that paper: a rule that stated that an individual is malnourished if $HAZ <= 2SD && -2SD <= WAZ <= 2SD$

They claim this rule alone classified correctly 99.7% of their instances (!). This seems like magic, so why not? Let's try it.
I adjusted a bit those values and created a feature based on the rule which, out of lack of a better name, I called it "Magic".
It ended up as one of the most important features in my model.

// filas con todas las nuevas features


# Combining everything
<!-- - stacking -->
Until now I've been running each dataset an change separately and submitting those solutions. One idea in machine learning that works very well is to "combine" several models into a better model. There are different approaches to do this like boosting, bagging and stacking.
Our base model, Gradint Boosting, already uses this idea by having an ensamble of trees internally.

For my models I used stacking. This means making a new dataset from the solutions of other models, and running another classifier on top of that.

// grafiquito con varios models->un model de stack -> solucion

<!-- - modelo y puntaje final -->
So what I'm combining here? I've been running each of the datasets described with a simple gradient boosting algorithm. What I'll do is to get all those predictions and make a new dataset with each prediction as a feature column and I'll run a prediction algorithm on that to get the final result.

I've described three datasets until now: 4-dataset, 3-dataset and the original one. But I can play a little more with this, lets remember our target variable definition:


<div class="tabla" >
<table >
<tr style="background-color:rgba(217, 238, 249, 0.75) !important">
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

What happens if I remove this restriction? For each of my datasets I made another one where the target variable doesn't have this condition. This means that "decae" will be independent of previous values, it will only depend on the new checkup. Now I have $3 * 2 = 6$ datasets.

Going further, I made other datasets but instead of removing the restriction for all variables, I removed it for one variable at a time. For example, a made a new data set removing the condition on HAZ but keeping WAZ and BMIZ untouched. That's three more datasets for each one of the originals: $3 * 2 + 3 * 3 = 15$.

One last idea, I can try to predict our target variable using only one column of the original dataset at a time. For example, trying to predict "decae" only by looking at the date of birth. Each of these predictions by themselves are very bad, but I combined the results into a new dataset, having each prediction as a feature column (yes, it is stacking again, I made a lesser stacked model to use on our final stacking model).

This brings the total to sixteen different models. Like I said before, I put each of the individual predictions of each of the sixteen datasets as columns and predicted that final set with another model (that ended up being gradient boosting again, but with other parameters).

This was my final model.

# Adjusting knobs

coso de busqueda hyper




<!-- - cosas que mejorar y cosas que quedaron -->
<!-- - conclusion de la historia -->
