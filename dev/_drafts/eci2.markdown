---
layout: post
title:  "Predicting growth in children - part 2/2"
categories: kaggle scikit
permalink: eci2/
---

<!-- /_sass/minima/_layout -->



<!-- - cada uno de los diferentes datasets -->
# Datasets

Now we can try to build another dataset that takes advantage of the history of the patient. What I did was to concatenate together
all the three or four rows for each patient into only one row. For the patients with three rows in the train set, I concatenate them
with the corresponding row of the test set. Now we have a dataset of a history of four checkups per row.
The disadvantage is that now I have a much smaller train set, 6200~ versus the original 42000~.

// dibujito de concatenar 4

Another thing I did was not to take all four rows, but making a dataset of three checkups per row. I can grab any three rows of the four-row patients,
and the three-row patients corresponding to the rows of the test set. Now I have twice as much training rows, 12000~.

// dibujito de concatenar 3

I also kept the original dataset to use for training. I think it can't hurt to train a separate model with it.
Those are the main three datasets I used in my final solution, but on the journey I made a lot more of (failed) experiments.

Now is also time to add some more work to the pipeline. With scikit-learn we can automatically divide the train datasets into
three parts: train/test/validation. This will became super handy because we leave the original test set untouched, meaning that
we won't overfit to the test data. Another basic thing is to have a cross validation method (also coming almost for free in scikit)
to check an estimation of our score locally.

From now on I'll name these datasets: 4-dataset, 3-dataset and original dataset respectibily.

Running the 4-dataset on our basic pipeline and submitting the solution resulted in a score of *0.785*.
Nice improvement!

<!-- - feaures engs que se hicieron -->

# Pulling features out of my hat

Ok, we have our pipeline working, explored our data, made maps and created new datasets. Now what?
We can start looking into making new features and transforming the existing ones into a better representation for the classifier.
I added features based on the map data we talked about earlier, combinations of the original features and insights from other studies
on the same subject. Some of these worked flawlessly and others were terrible.

Let's start with the map data we talk about earlier. I used what I saw in the map to clusterize "by hand" the hospitals and made 14 different regions.

//mapa regiones

It was a promising idea but sadly it didn't work at all. The gradint boosting method lets you look at which features were more important
at the moment of taking a decision. This new clusterization wasn't important at all.

On the other hand, the other approach of having the proportion of true/false for each hospital was surprisingly good.
This feature improved the overall score.

In the 4-dataset, I had four instances of HAZ, WAZ and BMIZ over time. I wanted to use this information, and
to let know the classifier that they are related somehow. I came up with a method that, per row, adjusts a linear regression
over these four values and adds the slope and intercept of the fitted line as new features.

// dibujito de LR

I also added second grade polynomic features based on HAZ, WAZ and BMIZ. This means to take each of the features and multiply them by all others (including itself).
In my particular case, in the 4-dataset for example, I took HAZ_1, ..., HAZ_4 and combined them into:

$HAZ_1 * HAZ_1$, $HAZ_1 * HAZ_2$, $HAZ_1 * HAZ_3$, $HAZ_1 * HAZ_4$, $HAZ_2 * HAZ_2$, $HAZ_2 * HAZ_3$, $HAZ_2 * HAZ_4$, $HAZ_3 * HAZ_3$, $HAZ_3 * HAZ_4$, $HAZ_4 * HAZ_4$

The same process was applied to WAZ_1...WAZ_4 and BMIZ_4...BMIZ_4. This added 30 new features in total.


The problem we're studing, the one of children growth, must be a common one and other articles and papers *must* exist on the subject.
In fact there're a lot. This one in particular caught my attention because it tries to solve a very very similar problem on children
in Ethiopia. I took a result, a hard rule that stated that an individual is malnourished if:

$HAZ <= 2SD && -2SD <= WAZ <= 2SD$

They claim this rule alone classified correctly 99.7% of their instances (!). This seems like magic, so why not? Let's try it.
I adjusted a bit those values and created a feature based on the rule which, out of lack of a better name, I called it "Magic".
It ended up as one of the most important features in my model.

// filas con todas las nuevas features
//https://www.omicsonline.org/open-access/predicting-under-nutrition-status-of-under-five-children-using-data-mining-techniques-2157-7420.1000152.pdf

# Combining everything
<!-- - stacking -->
Until now I've been running each dataset an change separately and submitting those solutions. One idea in machine learning that
seems to work very well is "combining" several models into a better model. There are different approaches to this like ensambling, bagging and stacking.
Our base model, Gradint Boosting, uses an ensamble of trees internally.

For my models I used stacking. This means making a new dataset from the solutions of other models, and running another
classifier on top of that.


<!-- - modelo y puntaje final -->
<!-- - cosas que mejorar y cosas que quedaron -->
<!-- - conclusion de la historia -->
