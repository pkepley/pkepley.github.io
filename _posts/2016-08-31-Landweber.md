---
layout: post
published: false
title: Noise-Free Landweber Iteration
tag: [Toy Problem, Numpy, Gradient Descent]
---

For the last few weeks I have been looking at a problem which involves
solving a certain family of linear problems, let's just say $$y = Ax$$
for sake of discussion. In these problems, the operator $$A$$ happens
to have a highly non-trivial null-space. So, in order to obtain a
unique solution for a given $$y$$, I simply choose the smallest norm
$$x$$ satisfying the problem. Put differently, I'm choosing $$x =
x^\dagger$$ where $$x^\dagger := A^\dagger y$$ and $$A^\dagger$$
denotes the Moore-Penrose pseudo-inverse of $$A$$.

This has left me thinking about how one can actually go about
obtaining the solution $$x^\dagger$$. There are, of course, a variety
of techniques for obtaining the minimum norm solution to a linear
problem, but a candidate choice would be to use the Landweber
iteration with zero starting value. The precise reasons why I am
interested in using this iteration for my present problem are outside
the scope of this post, but as shown in [Engl et
al.](http://www.springer.com/gp/book/9780792341574), the Landweber
iteration with zero initial guess and noise free $$y$$ converges to
the minimum norm solution to $$Ax = y$$ provided that $$y$$ is in the
domain of $$A^\dagger$$.  So, employing this iteration will give me
the desired minimum norm solution. Also, I will probably end up
considering noisy $$y$$, and when coupled with the discrepancy
principle, the Landweber iteration provides a regularization
strategy. That the Landweber iteration yields a regularization
strategy is likely the main reason that this iteration is interesting,
but the current post will focus on the noise free case where we don't
have to worry about early termination.

In this post I'm going to briefly derive the Landweber iteration in
the noise free setting, but the bulk of this post will cover an
application to a very simple toy problem. This problem is so simple
that we can compute everything we need to know, and hence will allow
us to demonstrate some properties of the general algorithm. In
particular, I'll show what happens when we start the iteration from
different starting points.

The notebook for exploring this blog post is located on [my
github](https://github.com/pkepley/Miscellaneous/blob/master/BlogPostNotebooks/NoiseFreeLandweber.ipynb)

[//]: This approach is relevant to my application in
[//]: particular, since I will (most likely) have to consider noisy
[//]: measurements of $$y$$ anyhow. That is, instead of $$y$$ I will
[//]: probably have to consider a measurement $$y^\delta$$ which is only
[//]: known to precision $$\delta > 0$$, i.e. that satisfies $$\|y - y^\delta
[//]: \| < \delta$$. In that case, we won't end be able to obtain the
[//]: minimum norm solution $$x^\dagger$$ but by using a regularization
[//]: strategy we can obtain an approximation that depends on the noise
[//]: level $$\delta$$.


### Motivating the Landweber Iteration

A fairly straightforward perspective for the Landweber iteration is
that it is a gradient descent for the squared $$L^2$$ error for the
equation $$y = Ax$$. To elaborate, we will suppose that $$y$$ is in
the range of $$A$$ and note that *a solution* to $$y = Ax$$ will
necessarily minimize the following objective:

$$ J(x) := \|Ax - y \|^2. $$

We obtain a minimizer of $$J$$ by applying gradient descent. To that
end, a quick computation shows that the gradient of $$J$$ is: \\[
\nabla J (x) = A^t (Ax - y).\\] So, the Landweber iteration is as
follows: given an initial guess $$x^* $$, we set $$x_0 = x^*$$ and
obtain gradient descent for $$J$$ with step length $$\omega$$ by the
iteration \\[x_{k+1} = x_{k} - \omega A^t (Ax_k - y)\quad\text{for $k
=0,1,2,\ldots$}\\] To ensure that this iteration will converge, it
suffices to take $$\omega < 2\|A\|^{-2}$$. To see that this suffices,
one can consider the Landweber iteration as a fixed point iteration
for \\[ x = x + \omega A^t(y - Ax).\\] As pointed out in Engl et. al.,
if $$ \|\omega^{1/2} A\|^2 < 2 $$, then the operator $$I - \omega A^t
A $$ will be non-expansive and the fixed point iteration will
converge.

Then, if one chooses $$x^* = 0 $$ and $$\omega$$ so that
$$\|\omega^{1/2} A\| < 1$$, one has the following:

**Theorem**: If $$y \in D(A^{\dagger})$$, $$ \omega^{1/2} \|A\| < 1$$,
  $$x_0 = x^* = 0$$, then $$x_k \rightarrow A^\dagger y$$ as $$k
  \rightarrow \infty$$.

Note: In the finite dimensional case, $$y \in R(A) \iff y \in
D(A^\dagger)$$.

## Toy Example

### Setting

We consider a toy two dimensional problem with matrix $$A$$,

$$A = \left(\begin{matrix} 2 & 2 \\ 1 & 1 \end{matrix}\right).$$

See $$A$$ has range:

$$ R(A) = \{ x \in \mathbb{R}^2 :  x = \lambda (2,1)^t, \quad\text{for some  $\lambda \in \mathbb{R}$}\}. $$

For sake of investigation, let's consider the case: 

$$ y = (2,1)^t.$$

A short calculation shows that solutions to $$y = Ax$$ must be of the
form:

$$ x = (x_1, 1- x_1)^t, \quad x_1\in\mathbb{R}.$$

Let us also point out that a short computation shows that $$\|A\| =
\sqrt{40}$$.

[//]: ### Norm of $$A$$
[//]: Now let's quickly figure out how big we can allow $$\omega$$ to
[//]: be. To do this, we compute the norm of $$A$$. See that
[//]: $$A(x_1,x_2)^t = (x_1 + x_2) (2,1)^t$$, so, $$ \|Ax\| = |x_1 + x_2|
[//]: \sqrt{5}$$. Since $$ \|A\| = \sup_{\|x\| \leq 1} \|Ax\|$$, and $$|x_1
[//]: + x_2| \leq 2\sqrt{2}$$ for $$x$$ in the unit disk, we conclude
[//]: that $$\|A\| = \sqrt{40}$$.

[//]: So, to guarantee convergence of the iteration we need to at least take
[//]: $$ \omega < 1 / 20$$, while to guarantee that the conditions of the
[//]: Lemma hold, we should take $$ \omega < 1/40$$.

###  Path of iterates

For this toy problem, our iterates proceed along a fairly simple
trajectory, in fact the iteration is constrained to move along a
line. To see this, let us first point out that \\[ x_{k+1} - x_{k} =
\omega A^t (y - Ax_k) \implies x_{k+1} - x_{k} \in R(A^t).\\] So to
trace the path of our iterates we should look at the range of
$$A^t$$. See,

$$A^t = \left(\begin{matrix} 2 & 1 \\ 2 & 1 \end{matrix}\right).$$

Hence, $$A^t (x_1,x_2)^t = 2(x_1 + x_2) (1,1)^t$$, and thus the range
of $$A^t$$ is:

$$ R(A^t) = \{ \lambda (1,1)^t : \lambda \in \mathbb{R} \}. $$

So, starting the iteration from $$x^*$$, the iterates are constrained
to move along the line:

$$ L = x^* + \lambda (1,1)^t, \quad \lambda \in \mathbb{R}. $$

### Convergence of iterates

If $$\omega$$ is sufficiently small, the iteration will converge, and
the expression for the difference between iterates shows that they
will converge to a vector $$x$$ satisfying $$ y - Ax \in N(A^t)
$$. The expression above shows that:

$$ N(A^t) = \{ (x_1, - x_1)^t : x_1 \in \mathbb{R} \}. $$

So, if $$x_p$$ denotes *any solution* to $$y = Ax$$ then any other
solution $$x_s$$ can be expressed as $$x_s = x_p + \lambda (1,-1)^t$$
for some $$\lambda \in \mathbb{R}$$. Since $$x_p = (0,1)^t$$ is *a
solution*, we get that the full solution space is:

$$ M = x_p + N(A^t), $$

which we can re-write as

$$ M = (0,1)^t + \mu (1,-1)^t,  \quad \mu\in\mathbb{R}.$$

Note that this agrees with the expression above. Thus for our toy
example, the iterates move along the line $$L$$, and if the iteration
converges, it converges to the point $$x^\dagger_{x^*}$$ lying at the
intersection of the lines $$L$$ and $$M$$.

Now let's discuss the solution $$x^{\dagger}_{x^*}$$ a bit
further. See that $$L$$ and $$M$$ are perpendicular to one another,
since $$(1,1)^t \cdot (1,-1)^t = 0$$. Thus, because $$x^*$$ lies on
the line $$L$$, the intersection point $$x_{x^*}^\dagger$$ represents
the closest point to $$x^*$$ on $$M$$. Since, $$x_{x^*}^\dagger \in
M$$, it solves $$y = Ax$$. Thus, the iteration converges to the
closest solution to $$x^*$$.  In particular, we see that an iteration
starting from $$x^* = 0$$ converges to the minimum norm solution
$$x^\dagger$$.

### Examples for different starting points

Here we plot the Landweber iterates for two starting points, $$x^* =
(0,0)^t, (1.0,0.5)^t$$. The line $$M$$ (the solution space), is
plotted in green, while the lines $$L$$ for each starting point
$$x^*$$ are plotted in blue. We use a step size $$\omega = 1.0/40.0$$
to ensure convergence, although some experimentation shows that much
larger values for $$\omega$$ work in this case.

<center>
<img src="{{ url }}/assets/posts/img/noiseFreeLandweberTwoStartingPoints.png">
</center>

As expected, in both cases the iterates cluster around the
intersection between the lines $$M$$ and $$L$$, which corresponds in
each case to the point $$x_{x^*}^\dagger$$.


### Convergence to the $$x^*$$ minimum norm solution

Let's briefly compute the $$x^*$$ minimum norm solution,
i.e. $$x_{x^*}^\dagger$$. Writing $$x^* = (x_1^*, x_2^*)^t$$, we have
that $$x_{x^*}^\dagger = (\mu_{x^*},1-\mu_{x^*})^t$$ minimizes:

$$ \phi(\mu) = \|x^* - (\mu,1-\mu)^t\|^2.$$

Hence $$\mu_{x^*}$$ satisfies: 

$$ 0 = \phi'(\mu) = -2(x_1^* - \mu) + 2(x_2^* - 1 + \mu) \implies \mu_{x^*} =
\frac{1}{2}(x_1^* - x_2^* + 1).$$


Here we plot the distance between the $$x_k$$ and $$x_{x^*}^\dagger$$
as a function of the iteration number $$k$$. We use the expression
above to compute $$x_{x^*}^\dagger$$ for comparison. As above, we use
the iteration starting from $$x^{*} = (0,0)^t$$ and $$\omega = 1/40$$.

<center>
<img src="{{ url }}/assets/posts/img/noiseFreeLandweberConvergenceProfile.png">
</center>

Note that the gradient of $$J$$ is Lipschiz:

$$\|\nabla J(x) - \nabla J(z) \| = \|A^t(Ax-Az)\| \leq \|A\|^2\|x -
z\|,$$

so we know that the convergence rate should be linear. This can be
seen in the curve above.
