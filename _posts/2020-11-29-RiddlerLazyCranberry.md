---
layout: post
published: true
title: Inefficient Cranberry Sauce Passing Riddler
tag: [Riddler, Markov process]
---

In this post, I'll walk through my solution to last week's [cranberry
sauce passing
problem](https://fivethirtyeight.com/features/can-you-pass-the-cranberry-sauce/)
from FiveThirtyEight's "The Riddler."  In this problem, we're asked to
consider 20 guests sitting around a circular Thanksgiving table who
all need a serving of cranberry sauce. These guests are somewhat
lazy/careless, and whenever a guest receives the sauce, they will
randomly pass the sauce to their left or right with equal
probability. The guests continue in this fashion until everyone has
been served. Under these conditions, we are asked:
1. Assuming that the sauce begins in front of a pre-specified guest,
who has the greatest chance of receiving the sauce last?

The answer to this problem is different from what you might expect (I
definitely did *not* anticipate it), however, this distribution isn't
so interesting to look at. As such, I decided to consider the problem
for an arbitrary number of guests, and to consider the following
related questions:

{:start="2"}
2. How long should we expect the process to take, and how much more
   inefficient is this process than direct passing?
3. How much longer should we expect the process to take if a given
   guest is the last person to receive the sauce?
  
To answer these questions, I consider cranberry sauce passing as a
pair of discrete Markov processes. One process, the primary chain, is
used to track the guests who have already been served, while the other
process, the auxiliary chain, models how the sauce is passed before
reaching the next unserved guest.

Jupyter notebooks for my solutions can be found in this [github
repository](https://github.com/pkepley/blog-notebooks/tree/master/20201129_RiddlerSoln1120). In
one notebook
([`compute_analytical_solution.ipynb`](https://nbviewer.jupyter.org/github/pkepley/blog-notebooks/blob/master/20201129_RiddlerSoln1120/compute_analytical_solution.ipynb)),
I provide solutions to questions 1-3 using some standard (and one less
standard) theoretical results about Markov chains with absorbing
states. A second notebook
([`run_simulation.ipynb`](https://nbviewer.jupyter.org/github/pkepley/blog-notebooks/blob/master/20201129_RiddlerSoln1120/run_simulation.ipynb))
is provided, where I run a straightforward simulation of the process
to serve as a cross-check of my analytical solution. The simulation
results are designed to run in parallel and be fully reproducible,
which I haven't managed in the past. So, if you happen to have 16 cores on
your machine, you should be able to reproduce my results verbatim
&#128578;

[comment]: <> assign path for assets to avoid repeating myself
{% assign asset_path = base | append: "/assets/posts/img/Riddler_20201129_files" %}
[comment]: <> content begins below


## Cranberry Passing Markov Process

In order to determine who is last to be served, we only really need to
track the order in which guests are served. We can ignore the
intermediate left/right passes which occur amongst guests who have
been served already. With this in mind, we can model cranberry sauce
passing as a discrete Markov process whose states reflect which guest
has been served most recently and which guests have already been
served. For a table with 6 guests, the states can be depicted as
follows:

![six guest transition graph with symbols]({{ asset_path }}/compute_analytical_solution_18_0.png)

In the image above, white dots reflect guests who have not been served
yet, and blue dots are used to denote guests who have already been
served. Red dots are used to denote the most recently served guest
when unserved guests remain, while gold stars are used to indicate a
guest who is served last. Arrows have been drawn between states to
indicate the possible transitions.

Before labeling the states of the Markov process, we first index the
guests seated around the table. Let $$0$$ denote the guest who starts
the process. Note that guest $$0$$ can never be served last. The
remaining guests are enumerated counter-clockwise from guest $$0$$, so
that guest $$1$$ sits to the right of guest $$0$$, guest $$2$$ sits to
the right of guest $$1$$ and so on. Letting $$n_{guests}$$ denote the
number of guests, it follows that guest $$n_{guests} - 1$$ will be
sitting to the left of guest $$0$$.

To label the states of the cranberry passing Markov chain, we will use
the following notation. For non-terminal states, i.e. states which
still have unserved guests, we will use labels of the form
`(last_served, served_interval, n_served)`. Here `last_served` denotes
the guest who was served most recently, `served_interval` is a
two-tuple whose first entry is the served guest who is furthest to the
left of guest $$0$$, and whose second entry is the served guest who is
furthest to the right of guest $$0$$.  The third state component,
`n_served` is provided for convenience in computations (it isn't
strictly necessary) and reflect the number of guests in
`served_interval`. Finally, since we're not really concerned with the
direction from which the sauce arrives to the last guest, we simply
label terminal states (i.e. states where the final guest is served)
with the index for the guest who is served last.

Using this notation, the states for a table with 6 guests can be
depicted as follows:

<a href id="six_guest_DAG"></a>
![six guest transition graph with labels]({{ asset_path }}/compute_analytical_solution_16_0.png)

In the image above, I have indicated the probabilities for each
transition, which will be discussed in the next section.

### Transition Probabilities

To determine the transition probabilities, we now introduce an
auxiliary Markov chain, which tracks the left/right passes through
the interval of previously guests up until the sauce exits to the left
or right of the interval. This kind of process is known as a
"Drunkard's Walk" on a finite interval. In our case, the walker in the
process begins on one edge of a finite interval of length `n_served`
and takes steps to the left or right with equal probability. Under
these conditions, it can be shown (see e.g. [this
discussion](https://puzzling.stackexchange.com/questions/6415/does-the-drunk-man-fall-off-the-cliff-a-random-walk-problem))
that the walk will eventually exit the interval, and that it will exit
through the edge nearest or furthest from the initial edge with
probabilities:

$$
\begin{array}{lcl}
P(\text{walk exits through near edge}) &=& \frac{1 - n_{\text{interval}}}{n_{\text{interval}}}, \\
P(\text{walk exits through far edge}) &=& \frac{1}{n_{\text{interval}}}
\end{array}
$$

Thus for transitions to non-terminal states, the cranberry passing
Markov chain transition probabilities are given by:

$$
P(S_{t+1} = S_j | S_{t} = S_i) = \left\{
\begin{array}{cl}
\frac{1 - n_{\text{served}}}{n_{\text{served}}} & S_j = S_{\text{near}, i} \\
\frac{1}{n_{\text{served}}} & S_j = S_{\text{far}, i} \\
0 & \text{else}
\end{array}
\right.
$$

Where, if the walk begins on the left edge of `served_interval`, that
is, if $$S_i =
(\text{left},~(\text{left},~\text{right}),~n_\text{served})$$ then

$$
\begin{array}{lcl}
S_{\text{near}, i} &=& (\text{left} - 1,~(\text{left} - 1,~\text{right}),~n_\text{served} +1)\\
S_{\text{far}, i} &=& (\text{right} + 1,~(\text{left},~\text{right} + 1),~n_\text{served} + 1).
\end{array}
$$ 

If the walk begins on the right edge, i.e. $$S_i =
(\text{right},~(\text{left},~\text{right}),~n_\text{served})$$, then
the formulas for $$S_{i, \text{near}}$$ and $$S_{i,\text{far}}$$ are
exchanged. (Note we are identifying $$-1$$ with $$n_{\text{guests}} -
1$$ here).

Finally, transitions from states with $$n_\text{served} =
n_{\text{guests}} -1$$ to the terminal state corresponding to the
final remaining guest occur with probability 1, and the cranberry
passing process remains in these terminal states with probability 1.

To get a feel for how this shakes out, you might want to refer to the
[graph above](#six_guest_DAG), which indicates the transition
probabilities along the graph edges. I have intentionally suppressed
self-loops for the terminal states, so you won't see those
probabilities highlighted above (e.g. state $$1$$ should have a loop
back to itself with an edge with a label of 1). Alternatively, you can
have a look at the following figure, which shows the cranberry passing
transition matrix as a heat-map:

![six guest transition matrix]({{ asset_path }}/compute_analytical_solution_15_0.png)

Although I like the aesthetic of the heat-map a bit better, I think
it's somewhat harder to parse than the other figure &#128578;

## Solution Method for Question 1

By construction, the transition matrix for the cranberry passing
process has already been placed in canonical form (see
e.g. [Wikipedia](https://en.wikipedia.org/wiki/Absorbing_Markov_chain#Canonical_form)). That
is,

$$P = \left(
\begin{array}{cc} 
 Q & R\\
 0 & I_r
\end{array}
\right)$$ 

Here $$r = n_\text{guests} - 1$$ is the number of terminal states.

The probability that the Markov chain terminates in state $$j$$
beginning from state $$i$$ can be obtained from the $$(i,j)$$ entry of
the matrix $$B$$ where $$B$$ solves:

$$ (I - Q) B = R$$

Since the cranberry sauce passing process begins from state $$(0,
(0,0), 1)$$, we need only to consider the row associated with this
state from the matrix $$B$$.

## Solution Method for Questions 2 & 3

We will answer question 2, i.e. to compute the unconditioned mean
number of passes, by first solving question 3, that is, by computing
the mean number of passes conditioned on a specific guest being last.

To that end, let $$k \neq 0$$ be one of the guests. We will compute
the mean number of passes made, conditioned on $$k$$ receiving the
sauce last, by looking at all of the paths through the cranberry
passing state-space which terminate with $$k$$. For each such path, we
can estimate the expected number of sauce passes by computing the
expected number of passes associated with each transition in the path
and summing the results together. Finally, we need only sum the path
means together weighted by the conditional probability of each path
given that $$k$$ is served last.

That is, letting $$\Gamma$$ denote the set of paths from
$$(0,(0,0),1)$$ to $$k$$, i.e. 

$$\Gamma = \{S_1, \ldots, S_\text{n_guests} : S_1 = (0,(0,0), 1),
S_{n_\text{guests}} = k, P_{S_{t+1}S_{t}} > 0~\text{for $t
= 1,\ldots,n_{guests}-1$} \}$$

We can compute:

$$E[N_\text{passes} | \text{$k$ is last}] = \sum_{\gamma \in \Gamma} E_\gamma[n_\text{passes}]\cdot P(\gamma | \text{$k$ is last})$$

where $$E_{\gamma}[n_\text{passes}] = \sum_{i=1}^{n_\text{guests}}
E[N_{\text{passes}, S_i, S_{i+1}}]$$, and $$E[N_{\text{passes},
S_i,S_{i+1}}]$$ is the expected number of passes when the sauce
transitions from state $$S_i$$ to state $$S_{i+1}$$.

For the transitions to non-terminal states (i.e. $$i <
n_\text{guests}-1$$), the last quantity, $$E[N_{\text{passes},
S_i,S_{i+1}}]$$, is the expected number of steps until absorption in
the Drunkard's walk on an interval of length $$i$$ described above,
conditioned on this process starting on one edge and exiting from the
near edge or far edge, depending on whether $$S_{i+1}$$ is the near or
far edge from $$S_i$$. For the terminal transition (i.e. $$i =
n_\text{guests}-1$$), we need the unconditioned mean number of steps
until absorption when the process starts on one edge of a length
$$n_\text{guests} - 1$$ interval instead.

The unconditioned expectation is easy to compute and follows from
standard results about absorbing Markov chains applied to the
Drunkard's walk on an interval of length $$n_\text{guests}-1$$, see
e.g. [Wikipedia's discussion on absorbing Markov
Chains](https://en.wikipedia.org/wiki/Absorbing_Markov_chain#Expected_number_of_steps).
The conditioned expectations for the non-terminal transitions are a
bit trickier, but one can apply Theorem 1 [from this
paper](https://doi.org/10.1016/j.spl.2019.04.001) (which you can
obtain
[here](https://www.researchgate.net/publication/332384778_Applications_of_the_fundamental_matrix_to_mean_absorption_and_conditional_mean_absorption_problems))
to compute the mean number of steps in the cases when the Drunkard's
walk terminates in either the near or far edge. In any event, for both
the unconditioned and conditioned means, one only needs to solve a
linear system associated with the transition matrix for the
appropriate finite Drunkard's walk.

The only remaining component is the probability $$P(\gamma |\text{$k$
is last})$$. Let $$\gamma = (S_1,\ldots,S_{n_\text{guests}})$$ be one
of the paths in $$\Gamma$$. The unconditioned probability of
$$\gamma$$ is simply $$P(\gamma) = \prod_{1}^{n_\text{guests} - 1}
P_{S_iS_{i+1}}$$, and since $$\Gamma$$ contains all paths for which
guest $$k$$ is served last, the conditioned probability can be
obtained by

$$P(\gamma | \text{$k$ is last}) = \frac{P(\gamma)}{\sum_{\alpha \in
\Gamma} P(\alpha)}.$$

With this, we have all the required ingredients to compute
$$E[N_\text{passes} |\text{$k$ is last}]$$. Note that this method
*probably* isn't the simplest method possible, and that the set
$$\Gamma$$ can be very large -- so implementing the calculation as
described above is fairly computationally intensive.

The only remaining question to answer is how to compute the
unconditioned mean number of passes, which can be computed as follows:

$$ E[N_\text{passes}] = \sum_{k=1}^{n_\text{guests} - 1} E[N_\text{passes} |\text{$k$ is last}] \cdot P(\text{$k$ is last})$$

Essentially, to answer Question 2, we just combine the solutions for
Questions 1 & 3.

## Solutions for $$n_\text{guests} = 20$$

### Solution to Question 1
The following figures shows the solutions to Question 1 when
$$n_\text{guests} = 20$$.

![]({{ asset_path }}/compute_analytical_solution_23_0.png)

Note that the probability that guest $$k$$ is last does *not* depend
at all on where that guest is sitting! It really seems like guest 10,
who is furthest away from where the sauce begins, should be more
likely to be served last than guests 0 or 19 who are sitting next to
where the sauce starts. However this is *not* the case.

The solution for general $$n_\text{guests}$$ appears to be the same,
that is the probability that guest $$k \neq 0$$ is served last is
uniform across $$k$$, however I only checked $$n_\text{guests} \leq
20$$ and my solution doesn't easily generalize.

### Solution to Question 2
The average number of passes was found to be 190. In fact, it appears
that for any $$n_{\text{guests}}$$ the expected number of passes is
$$\left(\begin{array}{c} n_\text{guests}\\ 2\end{array}\right) =
\frac{n_\text{guests} \cdot (n_\text{guests} - 1)}{2}.$$

Since all $$n_\text{guests}$$ could be served in as few as
$$n_\text{guests} -1$$ passes, we see that the cranberry passing
process requires $$\frac{n_\text{guests - 1}}{2}\cdot 100\%$$ more
passes than necessary. For 20 guests, we can expect to observe 900%
more passes than is necessary!


### Solution to Question 3
The following figures shows the solutions to Question 2 when
$$n_\text{guests} = 20$$.

![]({{ asset_path }}/compute_analytical_solution_31_0.png)

Note that, unlike the probability discussed in Question 1, the
conditioned average number of passes behaves like one would
expect. That is, if the furthest guest from the starting point (guest
10) is served last, we can expect the process to terminate in around
220 passes, which is significantly longer than when the the last
served guest is sitting next to the first served guest (e.g. when
guest 1 is served last), which only takes 139 passes on average.

## Average Number of Passes
The following figures respectively show the average number of passes
and process inefficiency for $$n_\text{guests} = 2,\ldots,20$$.

|![Average number of passes]({{ asset_path }}/compute_analytical_solution_28_0.png)|![Inefficiency]({{ asset_path }}/compute_analytical_solution_29_0.png)|

As mentioned above, it appears that that $$E[n_\text{passes}] =
\frac{n_\text{guests} \cdot (n_\text{guests} - 1)}{2},$$ and that
inefficiency behaves like $$\text{Inefficiency}(n_\text{guests}) = \frac{n_\text{guests - 1}}{2}\cdot 100\%$$.


<!-- ## Validating Analytical Results via Simulation -->
<!-- ![]({{ asset_path }}/run_simulation_7_0.png) -->

<!-- |![]({{ asset_path }}/run_simulation_6_0.png)|![]({{ asset_path }}/run_simulation_6_1.png)| -->


<!-- 
![]({{ asset_path }}/compute_analytical_solution_19_1.png)
![]({{ asset_path }}/compute_analytical_solution_30_0.png)
![]({{ asset_path }}/compute_analytical_solution_22_0.png)
![]({{ asset_path }}/compute_analytical_solution_21_0.png)
-->
