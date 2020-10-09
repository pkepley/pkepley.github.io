---
layout: post
published: true
title: Markovian Dice Riddler
tag: [Riddler, Markov process]
usemathjax: true
---

In this post, I explore a solution to FiveThirtyEight's [Riddler problem from March 27th](https://fivethirtyeight.com/features/can-you-get-the-gloves-out-of-the-box/). In this problem, we are asked to consider a process in which we repeatedly roll a fair die in batch rounds of size equal to the number of sides on the die. After each round, the die is relabeled using the outcomes of the batch's rolls. Eventually, all faces of the die will receive the same label and we're asked: on average, how many rolls will it take before the die's faces are all the same? 

Since the relabelling occurs after each round, instead of answering how many *rolls* this process will take, I focused on answering how many *rounds* the process will take. In this post, I provide an <a href="#exact_solution" title="Jump to exact solution">exact solution</a>, based on considering the process as a Markov chain. I also <a href="#simulated_solution" title="Jump to simulation solution">simulated the process </a> and <a href="#final_results" title="Jump to final results">compared the simulated results</a> to the exact results &mdash; mostly as a sanity check against my exact solution (: 

The notebook for this post may be found [here](https://github.com/pkepley/blog-notebooks/blob/master/20200403_RiddlerSoln0327/riddler_20200327.ipynb).

## Prompt:

For reference, here's a verbatim copy of the prompt that we will be working on (copied directly from [FiveThirtyEight's](https://fivethirtyeight.com/features/can-you-get-the-gloves-out-of-the-box/) site):

>You start with a fair 6-sided die and roll it six times, recording the results of each roll. You then write these numbers on the six faces of another, unlabeled fair die. For example, if your six rolls were 3, 5, 3, 6, 1 and 2, then your second die wouldn’t have a 4 on it; instead, it would have two 3s.
>
>Next, you roll this second die six times. You take those six numbers and write them on the faces of yet another fair die, and you continue this process of generating a new die from the previous one.
>
>Eventually, you’ll have a die with the same number on all six faces. What is the average number of rolls it will take to reach this state?
>
>Extra credit: Instead of a standard 6-sided die, suppose you have an N-sided die, whose sides are numbered from 1 to N. What is the average number of rolls it would take until all N sides show the same number?


### Process Illustration <a id="process_illustration"></a>
Before digging into the solution, I'll give a brief illustration of
the dice rolling process. In the following visualization, I'll first
show the initial dice labels (i.e. 1&ndash;6 at round 0) followed by
the random dice labels obtained after each subsequent batch of
rolls. The figure will only update when the outcomes of the current
round differ from the outcomes in the previous round. Also, the dice
labels will briefly flash green when the process ends before starting
over.


<link rel="stylesheet" type="text/css" href="../assets/posts/20200404_RiddlerSoln20200327/dice.css"/>  
<script src="{{ base }}/assets/posts/js/d3.v5.min.js"></script>

<center>
	<div id="summary_div" width = "50%"></div>
</center>
<script src="{{ base }}/assets/posts/20200404_RiddlerSoln20200327/dice.js"></script>

## Exact Solution <a id="exact_solution"></a>

To begin, we'll introduce a concept that we will use to specify the states of the Markov chain that we use to solve the prompt problem.

**Definition:**  the *uniqueness type* of a finite set $$S$$ will be defined to be the descending ordered sequence of repetition counts for the distinct elements of $$S$$. I.e. let $$S$$ be a finite set with elements labeled $$s_1,\ldots,s_k$$, that are repeated respectively $$m_1,.\ldots,m_k$$ times in $$S$$ with $$m_1 \geq m_2\geq \ldots m_k$$. Then the uniqueness type of $$S$$ is the list: $$[m_1, \ldots, m_k]$$.

**Examples:** consider a $$6$$-sided die with labels $$S = \{1,2,1,3,4,2\}$$. Then the uniqueness type of this die is $$[2,2,1,1]$$ (since $$1$$ and $$2$$ appear twice, while $$3$$ and $$4$$ both appear once). Likewise,  a $$6$$-sided die with labels $$S = \{1,2,3,2,1,1\}$$ would have uniqueness type $$[3,2,1]$$. A $$6$$-sided die with identical sides would have uniqueness type $$[6]$$.

The rolling process can be considered as a Markov process whose states are the uniqueness types of dice labels observed after each batch of rolls. The rationale for this, is that the number and occurrence frequency of the labels on the die are the only important details required to assess the outcomes from each batch round. This Markov chain has an absorbing state, corresponding to the uniqueness type where all the die's sides are the same. This is given by the uniqueness type $$[n_{sides}]$$, where, $$n_{sides}$$ is the number of sides on the die. 

To obtain the mean time until the die has all equal sides, we simply need to find the mean time to absorption when the process starts from a die with distinct side labels. Denoting by $$P$$ the transition matrix for this Markov process, we can obtain the vector of mean absorption times $$\mu$$ by solving

$$(I - R)\mu = \mathbf{1}$$

where $$R$$ is the submatrix of $$P$$ obtained by deleting row and column corresponding to absorbing state $$[n_{sides}]$$, and $$\mathbf{1}$$ is a column vector of $$1$$'s with the same number of rows as $$R$$. The vector $$\mu$$ gives the mean time to absorption from each state of the Markov process, but because we are only interested in the mean time to absorption from a die with distinct labels, we only need the entry in $$\mu$$ corresponding to this state.

We will need to compute the transition matrix $$P$$, and then solve for the vector of mean absorption times.

### Computing the Transition Matrix 

Suppose that we have a die whose sides are labeled $$L_1, \ldots, L_k$$, repeated respectively $$m_1, \ldots m_k$$ times, with $$n_{sides} = m_1 +\cdots+m_k$$. Letting $$p_l$$ be the proportion of times that label $$L_l$$ appears on the die, i.e. $$p_l  = \frac{m_l}{n_{sides}}$$ for $$l = 1,\ldots,k$$, then the probability that we will observe $$n_l$$ occurrences of label $$L_l$$ in $$n_{sides}$$ rolls can be calculated using the [multinomial distribution](https://en.wikipedia.org/wiki/Multinomial_distribution), and is given by:

$$ P(n_1,\ldots, n_l) = \left(\begin{array}{c}n_{sides}\\ n_1,\ldots,n_l\end{array} \right) p_1^{n_1} \cdots p_k^{n_k}$$


We can use this observation to compute the transition probabilities of the Markov chain. To that end, denote the uniqueness type of the starting state by $$i_{type} = [m_1,\ldots, m_{k_i}]$$ and the target state by $$j_{type} = [n_1,\ldots, n_{k_j}]$$. Note that we must have $$k_j \leq k_i$$, since the target state cannot have more sides than the starting state. For a representative die with the target uniqueness type, when ordered in decreasing order, the counts for the labels on the die will be given given by $$\tilde{n}_l = n_l$$ for $$l \leq k_i$$ and $$\tilde{n}_{l} = 0$$ for $$l = k_j + 1, \ldots k_i$$. The labels on the target die can be in any permutation of the original label order. The probability that the die will transition from the starting state into any *particular* die in the target state can be obtained from the formula above. The probability that the die will transition from the starting state into the target state is the sum over the probability of transitioning from the starting state into each of the possible dice in the target state, which is given by:

$$ P(i_{type},~j_{type}) = \sum_{\sigma \in \Gamma} \left(\begin{array}{c}n_{sides}\\\sigma(\tilde{n}_{1}),\ldots,\sigma(\tilde{n}_{k_i})\end{array} \right) p_1^{\sigma(\tilde{n}_{k_1})} \cdots p_{k_i}^{\sigma(\tilde{n}_{k_i})}$$

Here, as above, we have $$p_l = \frac{m_l}{n_{sides}}$$ for $$l = 1, \ldots m_{k_i}$$, and $$\Gamma$$ is the set of all of the distinct permutations of the set $$[\tilde{n}_1,\ldots,\tilde{n}_{k_i}]$$.



```python
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import multinomial
from scipy.special import binom
from collections import Counter
from itertools import product, permutations
from copy import deepcopy
import pandas as pd

import pathos.multiprocessing as mp
```

#### Helper functions for listing Markov states
The following functions are used to generate the uniqueness types for a die of side $$n$$.


```python
# rule_asc: Used to generate ascending partitions of an integer
# http://jeromekelleher.net/generating-integer-partitions.html
def rule_asc(n):
    a = [0 for i in range(n + 1)]
    k = 1
    a[1] = n
    while k != 0:
        x = a[k - 1] + 1
        y = a[k] - 1
        k -= 1
        while x <= y:
            a[k] = x
            y -= x
            k += 1
        a[k] = x + y
        yield a[:k + 1]

# Ascending partitions of an integer:
# e.g. 4: [[1, 1, 1, 1], [1, 1, 2], [1, 3], [2, 2], [4]]
def ascending_partitions(n):
    return list(rule_asc(n))

# Descending partitions of an integer:
# e.g. 4:  [[1, 1, 1, 1], [2, 1, 1], [3, 1], [2, 2], [4]]
def descending_partitions(n):
    return list(map(lambda s: list(reversed(s)), ascending_partitions(n)))
```

As an example, here are the uniqueness types for a $$6$$-sided die: 


```python
descending_partitions(6)
```




    [[1, 1, 1, 1, 1, 1],
     [2, 1, 1, 1, 1],
     [3, 1, 1, 1],
     [2, 2, 1, 1],
     [4, 1, 1],
     [3, 2, 1],
     [5, 1],
     [2, 2, 2],
     [4, 2],
     [3, 3],
     [6]]



#### Helper function for calculating transition probabilities
The following function is a helper function used to generate all of the unique permutations of a list with repetitions, which allow us to generate the set $$\Gamma$$ described above.


```python
# Get the list of distinct permutations of a list
def distinct_permutations(s_type):    
    n_distinct = len(s_type)
    return list(set(permutations(s_type, r = len(s_type))))
```

As an example, here are the unique permutations of the uniqueness type $$[2,2,1,1]$$


```python
distinct_permutations([2, 2, 1, 1])
```




    [(1, 2, 1, 2),
     (1, 2, 2, 1),
     (2, 2, 1, 1),
     (2, 1, 1, 2),
     (2, 1, 2, 1),
     (1, 1, 2, 2)]


#### Functions to Compute the Transition Matrix
We're now in a position to compute the transition probability matrix $$P$$.


```python
def transition_prob(i_type, j_type, n_sides):
    qi = (1.0 / n_sides) * np.array(i_type)
    
    if len(j_type) < len(i_type):
        n_pad = len(i_type) - len(j_type)
        j_type = j_type + [0]*n_pad
    
    p_ij = 0
    for e in distinct_permutations(j_type):
        p_ij += multinomial.pmf(e, n =n_sides, p = qi)
    
    return p_ij

def transition_matrix(n_sides):
    s_types = descending_partitions(n_sides)
    n_types = len(s_types)
    
    p = np.zeros((n_types, n_types))
    
    for i in range(n_types):
        i_type = s_types[i]
        
        for j in range(n_types):
            j_type = s_types[j]

            if len(j_type) <= len(i_type):
                p[i, j] = transition_prob(i_type, j_type, n_sides)
                
    return p, n_types, [''.join([str(k) for k in s]) for s in s_types]
```

Below we plot the transition matrices for 2 &ndash; 6 sided dice.


```python
fig, axs = plt.subplots(2, 3, figsize=(17,9))

for n_sides in range(2, 6 + 1):
    # Generate the transition matrices
    p, n_types, s_types = transition_matrix(n_sides)
    
    # Columns and row of subplots
    i, j = (n_sides - 2) // 3, (n_sides-2) % 3

    # Set ax and plot the image on it
    ax = axs[i][j]
    im = ax.imshow(p, cmap='Blues')

    # Minor ticks to add borders to squares
    # https://stackoverflow.com/questions/38973868/adjusting-gridlines-and-ticks-in-matplotlib-imshow
    ax.set_xticks(np.arange(-.5, n_types, 1), minor=True)
    ax.set_yticks(np.arange(-.5, n_types, 1), minor=True)        
    ax.grid(which='minor', color='k', linestyle='-', linewidth=1.5)
    
    # Title for subplot
    ax.set_title('{}-sided Die'.format(n_sides))
    
    # X-labels
    ax.set_xticks(np.arange(n_types))
    ax.set_xticklabels(s_types, rotation=90)

    # Y-labels
    ax.set_yticks(np.arange(n_types))
    ax.set_yticklabels(s_types, rotation=0)

fig.delaxes(axs[1, 2])
fig.colorbar(im, ax=axs.ravel().tolist())
plt.show()

```


![png]({{ url }}/assets/posts/img/Riddler_20200327_files/riddler_20200327_16_0.png)


### Computing the Exact Solution

Here we solve the problem for 2 &ndash; 10 sided dice.


```python
ps = dict()
mus = dict()
average_relabelings_exact = dict()
states = dict()

for n_sides in range(2, 10 + 1):
    # Generate the transition matrices
    p, n_types, s_types = transition_matrix(n_sides)
       
    # Solve for the mean time to absorption (mu)
    R = p[:-1,:-1]
    mu = np.linalg.solve(np.eye(n_types - 1, n_types - 1) - R, np.ones((n_types - 1,1)))
    
    # Append result to dict
    ps[n_sides] = deepcopy(p)
    mus[n_sides] = deepcopy(mu)
    average_relabelings_exact[n_sides] = mus[n_sides][0].item()
    states[n_sides] = deepcopy(s_types)
```

The results are displayed below in the <a href="#final_results" title="Jump to final results">Final Results section</a>.

## Simulation <a id="simulated_solution"></a>

In this section, we simulate the relabeling process. The simulation is straightforward, so I won't provide too many details.

#### Helper function to check if sides are equal

The following function will be used to check to if the sides of a die are all equal or not.


```python
# https://stackoverflow.com/questions/3844801/check-if-all-elements-in-a-list-are-identical
def check_equal(iterator):
    iterator = iter(iterator)
    try:
        first = next(iterator)
    except StopIteration:
        return True
    return all(first == rest for rest in iterator)
```

The following two functions are used to simulate the rolling process.


```python
# Simulate the process of rolling a single die until the faces are all equal
def roll_until_same_face(n_sides):    
    n_relabelings = 0
    faces = np.arange(1, n_sides+1)
    
    while not check_equal(faces):        
        n_relabelings += 1
        faces = np.random.choice(faces, size = n_sides, replace=True)
    
    return n_relabelings

# Repeatedly simulate the rolling process
def repeat_roll_until_same_face(n_sides, n_repetitions, n_processors=1):
    n_relabelings = np.zeros(n_repetitions)

    with mp.Pool(n_processors) as p:        
        n_relabelings = p.map(lambda x: roll_until_same_face(n_sides), 
                              np.arange(n_repetitions))
    
    return n_relabelings
```

Now we simulate the process for dice with 2 &ndash; 10 faces.

Note: I don't bother to set a seed for reproducibility in this code since I'm running this with multiple processors, which will return results in a truly random order. As such, I can't guarantee exact reproducibility.


```python
n_repetitions = 500000

simulated_relabelings = dict()
average_relabelings_simulated = dict()

for n_sides in range(2, 10+1):
    n_relabelings = repeat_roll_until_same_face(n_sides, n_repetitions, 
                                                n_processors=24)
    simulated_relabelings[n_sides] = deepcopy(n_relabelings)
    average_relabelings_simulated[n_sides] = np.mean(n_relabelings)
```

## Final Results <a id="final_results"></a>

In this section we compare the simulation results to the exact results.

First, the results table:


```python
df = pd.DataFrame({
    'Number of Sides' : list(average_relabelings_exact.keys()),
    'Simulated' : list(average_relabelings_simulated.values()),
    'Exact' : list(average_relabelings_exact.values())}
)

df.style.hide_index().set_caption("Average # of Rounds Until Sides are Equal")

```


<style  type="text/css" >
</style><table id="T_2b9dea14_7a86_11ea_934b_a79c242e9bee" ><caption>Average # of Rounds Until Sides are Equal</caption><thead>    <tr>        <th class="col_heading level0 col0" >Number of Sides</th>        <th class="col_heading level0 col1" >Simulated</th>        <th class="col_heading level0 col2" >Exact</th>    </tr></thead><tbody>
                <tr>
                                <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow0_col0" class="data row0 col0" >2</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow0_col1" class="data row0 col1" >1.997650</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow0_col2" class="data row0 col2" >2.000000</td>
            </tr>
            <tr>
                                <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow1_col0" class="data row1 col0" >3</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow1_col1" class="data row1 col1" >3.837910</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow1_col2" class="data row1 col2" >3.857143</td>
            </tr>
            <tr>
                                <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow2_col0" class="data row2 col0" >4</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow2_col1" class="data row2 col1" >5.780578</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow2_col2" class="data row2 col2" >5.779310</td>
            </tr>
            <tr>
                                <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow3_col0" class="data row3 col0" >5</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow3_col1" class="data row3 col1" >7.721670</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow3_col2" class="data row3 col2" >7.711982</td>
            </tr>
            <tr>
                                <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow4_col0" class="data row4 col0" >6</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow4_col1" class="data row4 col1" >9.666184</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow4_col2" class="data row4 col2" >9.655991</td>
            </tr>
            <tr>
                                <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow5_col0" class="data row5 col0" >7</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow5_col1" class="data row5 col1" >11.641714</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow5_col2" class="data row5 col2" >11.608147</td>
            </tr>
            <tr>
                                <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow6_col0" class="data row6 col0" >8</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow6_col1" class="data row6 col1" >13.547576</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow6_col2" class="data row6 col2" >13.566288</td>
            </tr>
            <tr>
                                <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow7_col0" class="data row7 col0" >9</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow7_col1" class="data row7 col1" >15.445840</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow7_col2" class="data row7 col2" >15.529088</td>
            </tr>
            <tr>
                                <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow8_col0" class="data row8 col0" >10</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow8_col1" class="data row8 col1" >17.491852</td>
                        <td id="T_2b9dea14_7a86_11ea_934b_a79c242e9beerow8_col2" class="data row8 col2" >17.495620</td>
            </tr>
    </tbody></table>



Finally, a plot of the results:


```python
plt.plot(list(average_relabelings_exact.keys()),
         list(average_relabelings_exact.values()), 
         marker='.',
        label='Exact')
plt.plot(list(average_relabelings_simulated.keys()),
         list(average_relabelings_simulated.values()), 
         marker='.', 
         label = "Simulated")
plt.xlabel("Number of Sides")
plt.ylabel("Average Number of Rounds Until Equal")
plt.legend()
plt.show()
```

![png]({{ url }}/assets/posts/img/Riddler_20200327_files/riddler_20200327_31_0.png)

