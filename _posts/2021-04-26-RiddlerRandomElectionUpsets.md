---
layout: post
published: true
title: Random Election Upsets Riddler
tag: [Riddler]
---

In this post, I'll discuss the [Classic Riddler problem from April 23<sup>rd</sup>
2021](https://fivethirtyeight.com/features/can-you-cut-the-perfect-pancake/),
which asks us to consider a large nation of voters who independently submit
their vote between two candidates (A and B) by flipping identical fair coins.
We're asked: if 80% of votes are tallied on election day (regular votes), while
the remaining 20% (early votes) are tallied later, what is the probability of an
upset -- i.e. what is the probability that the election day outcome doesn't
match the final outcome?

[comment]: <> assign path for assets to avoid repeating myself
{% assign asset_path = base | append: "/assets/posts/20210426_RiddlerRandomElectionUpsets/" %}
[comment]: <> content begins below

As usual, I'll solve this problem in two ways. First I'll compute the result
using some gratuitous math, and then I'll run a simulation of the random process
to cross-check my analytical results. Since this problem isn't substantially
harder if we assume that 20% of votes are submitted early, or that an arbitrary
fraction of votes are submitted early, I'll solve the prompt in general and then
report the solution for the prompt as a special case. 

I've made the script for my solution available, so if you want to reproduce the
results, you can download the Pluto notebook (written in Julia) <a href="{{
asset_path }}/random_elections.jl">here.</a> I have also rendered the notebook
output statically for viewing <a href="{{ asset_path
}}/random_elections.jl.html">here</a>.

## Analytical Solution
First let's introduce a bit of notation. Throughout, we will use the subscripts
$$E$$ and $$R$$ to indicate quantities computed respectively for the early voter
and regular voter subpopulations. Similarly, we will use a subscript $$T$$ to
refer to the total population. We will use $$v$$ to denote the number of votes
in favor of candidate A in a population and $$n$$ will denote the number of
voters in a population. E.g. $$v_E$$ is the number of voters who voted for
candidate A in the early voter subpopulation, and $$n_E$$ is the number of
voters. Finally, we will use $$f$$ to denote the fracction of voters who belong
to a subpopulation, e.g. $$f_E = n_E / n_T$$.


### General Solution
Since each voter places their vote by independently flipping a fair coin, the
total number of votes for candidate A is distributed as $$v_\text{T} \sim
\text{Binomial}(n_T,~0.5)$$, and this remains true when we sub-divide into
regular and early voter sub-populations. That is,

$$\begin{array}{ccl}
v_R &\sim& \text{Binomial}(n_R,~0.5). \\
v_E &\sim& \text{Binomial}(n_E,~0.5), \\
\end{array}$$

The prompt tells us that the population is "large," which is a hint that we
should think about using the Normal approximation to the Binomial. To that end,
we recall that if $$m \sim \text{Binomial}(n, p)$$, then $$m$$ is approximately
$$\text{Normal}(\mu_m,\sigma_m)$$, where $$\mu_m = E[m] = pn$$, and $$\sigma_m =
\sqrt{np(1-p)}$$. Hence,

$$\begin{array}{ccl}
v_R &\approx& \text{Normal}(\mu_R,\sigma_R). \\
v_E &\approx& \text{Normal}(\mu_E,\sigma_E), \\
\end{array}$$

where $$\mu_R = 0.5n_R$$, $$\sigma_R = 0.5 \sqrt{n_R}$$ and an analogous
expressions hold for $$\mu_E$$ and $$\sigma_E$$.

An election upset will occur if candidate A wins the regular vote but loses the
total vote, or if candidate A loses the regular vote and wins the total vote.
Since both events occur with equal probability (since candidate A and B are
interchangeable), it follows that

$$P(\text{upset}) = 2 \cdot P(\text{A loses the total vote} \cap \text{A wins the regular vote}).$$

We can then re-write this as,

$$\begin{eqnarray}
P(\text{upset}) &=& 2 \cdot P(\text{A wins the regular vote} \cap \text{A loses the total vote}) \\
&=& 2 \cdot P(v_R > 0.5 \cdot n_R \text{ and }  v_T < 0.5 \cdot n_T)\\
&=& 2 \cdot P(v_R > 0.5 \cdot n_R \text{ and } v_E + v_R < 0.5 \cdot (n_E + n_R)) \\
&=& 2 \cdot P(v_R > \mu_R \text{ and } v_E + v_R < \mu_E+\mu_R) \\
&=& 2 \cdot P(v_R > \mu_R \text{ and } v_E < \mu_E + \mu_R - v_R). \\
\end{eqnarray}$$

Here we have used the fact that candidate A wins a round of votes if $$v >
0.5\cdot n$$, and used the expressions for $$\mu_R, \mu_E$$ from above.

Next, we note that $$v_E$$ and $$v_R$$ are independent so their joint density is
just the product of their respective densities. Using this obsevation and the
fact that both variables are normally distributed we obtain:

$$P(\text{upset}) = 2 \cdot \int_{\mu_R}^\infty \,dv_R \int_{-\infty}^{\mu_R + \mu_E - v_R}\,dv_E 
\frac{e^{-\frac{1}{2}(\frac{v_R-\mu_R}{\sigma_R})^2}}{\sigma_R\sqrt{2\pi}}
\frac{e^{-\frac{1}{2}(\frac{v_E-\mu_E}{\sigma_E})^2}}{\sigma_E\sqrt{2\pi}}.$$

We will now manipulate this expression so that it matches an expression that I
managed to find in a table of integrals 🙂. To that end, we make the
substitution $$w_R = \frac{v_R-\mu_R}{\sigma_R\sqrt{2}}$$, $$w_E = \frac{v_E
-\mu_E}{\sigma_E\sqrt{2}}$$, which (after some book-keeping) yields:

$$P(\text{upset}) = 2 \cdot \int_{0}^\infty \,dw_R \frac{e^{-w_R^2}}{\sqrt{\pi}} \int_{-\infty}^{-\frac{\sigma_R}{\sigma_E}w_R}\,dw_E \frac{e^{-w_E^2}}{\sqrt{\pi}}$$

Next, we recall that $$\text{erfc}(x) = \frac{2}{\sqrt{\pi}} \int_x^\infty
e^{-t^2}\,dt$$, and that $$\text{erf}(x) = 1 - \text{erfc}(x)$$ so the above can
be written:

$$\begin{eqnarray}
P(\text{upset}) &=&\int_{0}^\infty \,dw_R \frac{e^{-w_R^2}}{\sqrt{\pi}} \left(1 - \text{erf}(\frac{\sigma_R}{\sigma_E}w_R)\right)\\
&=&\int_{0}^\infty \,dw_R \frac{e^{-w_R^2}}{\sqrt{\pi}} - \frac{1}{\sqrt{\pi}} \cdot \int_{0}^\infty\,dw_R~e^{-w_R^2} \cdot \text{erf}(\frac{\sigma_R}{\sigma_E}w_R)
\end{eqnarray}$$

The first integral is equal to $$\frac{1}{2}\text{erfc}(0) = \frac{1}{2}$$. For
the second integral, we apply formula 2[^1] from section 4.3 of [this table of
integrals involving error
functions](https://nvlpubs.nist.gov/nistpubs/jres/73b/jresv73bn1p1_a1b.pdf) with
$$a = \sigma_R/\sigma_E$$ and $$b = 1$$, to obtain:

$$\begin{eqnarray}
P(\text{upset})&=&\frac{1}{2} - \frac{1}{\sqrt{\pi}} \left[\frac{\sqrt{\pi}}{2} - \frac{1}{\sqrt{\pi}}\tan^{-1}\left(\frac{\sigma_E}{\sigma_R}\right)\right]\\
&=&\frac{1}{\pi}\tan^{-1}\left(\frac{\sigma_E}{\sigma_R}\right)
\end{eqnarray}$$

Finally, since $$\sigma_E = \sqrt{\frac{1}{2}f_E\cdot n_\text{total}}$$,
$$\sigma_R = \sqrt{\frac{1}{2}f_R\cdot n_\text{total}}$$, and $$f_E + f_R = 1$$,
we conclude that:

$$\boxed{P(\text{upset})=\frac{1}{\pi}\tan^{-1}\left(\sqrt{\frac{f_E}{1-f_E}}\right)}$$

### Solution for the Prompt
In particular, for the case outlined in prompt with $$f_E = 0.2$$, we find:

$$\boxed{P\left(\text{upset}_\text{prompt}\right) = \frac{1}{\pi}
\tan^{-1}\left(\frac{1}{2}\right) \approx 0.14758}$$


## Simulation Solution
As discussed above, the number of votes for candidate A in the early and regular
vote subpopulations are both Binomial random variables. So, we simulate the
election tally by simulating appropriate Binomial random variables. From the
simulated results, we next determine if A wins on election night (i.e. if more
than 50% of the regular vote is for A) and determine the overall winner (i.e. if
more than 50% of the total vote is for A). An election upset results if A wins
in either the regular or total tally, but loses in the other tally. We simulate
this process 100K times and tally up the fraction of times that an election
upset occurred.

This process is repeated for 1001 evenly spaced early voter share fractions in [0,1], and the result is then compared (graphically) against the analytical solution.

<img src="{{ asset_path }}/election_upset_probability.svg">

The above figure shows great agreement between the exact solution discussed
above and the simulation results -- so I'd wager that my exact solution is
probably correct! 🙂

### Simulating the Prompt Solution
Finally, I simulated the election from the prompt (with 20% early voters) 10
million times to try to get a bit more accuracy from the simulation. This
resulted in an estimate of $$P(\text{upset}_\text{prompt}) \approx 0.14759575$$,
which agrees with the correct answer to four decimal places.


## Footnotes
[^1]: In the interest of self-containment, formula 2 from the linked article is: $$\int_0^\infty \text{erf}(ax)e^{-b^2x^2}\,dx = \frac{\sqrt{\pi}}{2b} - \frac{1}{b\sqrt{\pi}}\tan^{-1}\left(\frac{b}{a}\right)$$
