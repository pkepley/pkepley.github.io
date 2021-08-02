---
layout: post
published: true
title: Infinite Chain Link Riddler
tag: [Riddler]
---

In this post, I will walk through my solution to the most recent
[Riddler](https://fivethirtyeight.com/features/will-riddler-nation-win-gold-in-archery/)
problem. Here, we are asked to determine the path that is traced out by the tail
end of a certain rigidly moving finite length chain with infinitely many links.
While the behavior of each individual link in the chain is fairly complex, the
path traced by its tail is surprisingly simple! (Although maybe this shouldn't
have been surprising! 🙂)


[comment]: <> assign path for assets to avoid repeating myself
{% assign asset_path = base | append: "/assets/posts/20210802_RiddlerInfiniteChainLink"%}
[comment]: <> content begins below

## Introduction 
This week's
[Riddler](https://fivethirtyeight.com/features/will-riddler-nation-win-gold-in-archery/)
asks us to consider an infinitely long chain whose ordered link's lengths
decrease as a fixed proportion $$f \in (0, 1)$$ of each preceding link (i.e if
$$\ell_n$$ is the length of the $$n^{th}$$ link, then $$\ell_{n+1} = f \cdot
\ell_n).$$ This chain also has the property that whenever you adjust the angle
$$\theta$$ between any pair of successive links, then every other pair of
sequential links will bend to form the same angle (i.e. $$\angle(\text{link}_n,
\text{link}_{n+1}) = \theta$$ for all $$n$$). The following figure illustrates
the first few links of such a chain:

<center>
<img src="{{ asset_path }}/chain_demonstration.png" height="275px" width="auto">
</center>

Since $$f < 1$$, the chain has a finite length. Assuming that the first link's
left end is pinned at the origin and the chain starts out in a straight line
(i.e. $$\theta = 0$$), what curve does the chain's tail end sweep out as we vary
$$\theta$$?

In this post, I'll show that the chain traces out a circle (whose center and
radius depend on the scaling fraction $$f$$).

## Animation
Before we get into the details showing that the chain's tail traces out a
circle, I thought it would be helpful to take a look at an animated example. The
following figure shows the behavior of a finite approximation to the chain
described in the problem:

<center>
<img src="{{ asset_path }}/chain_animation.gif" height="275px" width="auto">
</center>

For this example, I took $$f = 0.75$$, but the general case looks pretty
similar. In this figure, I show the chain (in blue), its approximate tail (the
orange dot), and the full path traced out by its tail (the finite approximation
is shown in green, while the exact solution derived below is shown in purple).

The animation was made interactively using Julia in a Pluto notebook. To run the
code on your machine, you can download the notebook [here]({{
asset_path}}/chain.jl). A static version can be found
[here]({{asset_path}}/chain.jl.html).

## Deriving an Expression for the Chain's Tail
Let $$p_n$$ denote the vertices along the chain. By assumption, the first vertex
is constrained at the origin, i.e. $$p_0 = (0, 0)$$. For simplicity, we'll take
our units so that the zeroth chain has length $$1$$, meaning that the length of
the $$n^{th}$$ chain will be $$\ell_n = f^{n}$$ for $$n=0,1,\ldots$$. Next, let
$$\Delta p_{n}$$ denote the vector $$\Delta p_n = p_{n+1} - p_{n}$$. Since each
successive link is oriented at angle $$\theta$$ relative to the previous link,
and since the chain starts out parallel to the horizontal, the $$n^{th}$$ link
will be oriented at angle $$n \cdot \theta$$ relative to the horizontal. Putting
this together, we see: 

$$\Delta p_n(\theta) = f^{n} \cdot \left(\cos(n\theta),~\sin(n\theta)\right).$$

Thus $$p_n = \sum_{n=0} \Delta p_n$$, and the limiting tail end point of the
chain is given by:

$$\gamma(\theta) = \sum_{n=0}^{\infty} \Delta p_n(\theta).$$

Our goal will be to study how $$\gamma$$ behaves as we vary $$\theta$$. 

At this point, I'll note in passing that the series defining coordinate
functions in $$\gamma$$ are both sine and cosine Fourier series. This doesn't
turn out to be very helpful for analyzing $$\gamma$$... but it probably explains
how the author of the problem came up with the problem. That being said, because
it's often easier to work with complex Fourier series than sine and cosine
series, this fact prompted me to transition from thinking about the problem as a
planar geometry problem, and start thinking about it in terms of complex
complex valued functions.

To that end, we now identify $$(x,y) \leftrightarrow z = x+iy$$ and proceed in
polar form.

$$ 
\begin{eqnarray}
\Delta p_n &=& f^{n} \cdot \left(\cos(n\theta) + i \sin(n \theta)\right) \\
&=& f^{n} \cdot e^{in\theta}\\ 
\end{eqnarray}
$$

The series for $$\gamma$$ is now very simple to compute:

$$ 
\begin{eqnarray}
\gamma(\theta) &=& \sum_{n = 0}^{\infty} \Delta p_n \\
&=& \sum_{n = 0}^{\infty} f^n e^{i\theta} \\
&=& \sum_{n = 0}^{\infty} (f e^{i\theta})^{n} \\
&=& \frac{1}{1 - f e^{i\theta}}\\
&=& \left(\frac{1 - f\cos(\theta)}{f^2 - 2f\cos(\theta) + 1}\right) + i \left(\frac{f\sin(\theta)}{f^2 - 2f\cos(\theta) + 1}\right)
\end{eqnarray}
$$

Here, I have used the expression for the sum of a convergent geometric series on
the third line, and on the last line, I have used WolframAlpha (I was feeling
lazy 🙂). This last formula turns out to be somewhat harder to work with than
the formula on the second to last line. However, this last formula does provide
some useful insight (it's also pretty useful for plotting).

## Showing That the Image of $$\gamma$$ is a Circle
Although it's not immediately clear from the expression, the curve $$\gamma$$
traces out a circular arc as we vary $$\theta$$. To demonstrate this, it will
suffice to show that all points on $$\gamma$$ are equidistant from some central
point/complex number $$c$$. A candidate for $$c$$ can be identified from the
last formula by looking at the average and extremal real-coordinate values on
the interval $$[0, \pi]$$. To that end, notice that

$$\gamma_x(\theta):=\text{Real}\{\gamma\}(\theta) = \frac{1 -
f\cos(\theta)}{f^2 - 2f\cos(\theta) + 1} = \frac{1}{1 + f\cos(\theta)}$$ 

is largest when $$\cos(\theta) = - 1$$, resulting in $$\gamma = \frac{1}{1 -
f}$$, and smallest when $$\cos(\theta) = 1$$, where $$\gamma = \frac{1}{1+f}$$.
The average of these extremal values is $$c = \frac{1}{1 -f^2}$$, which we now
show is equidistant from all points on $$\gamma$$: 

$$
\begin{eqnarray}
\left| \gamma(\theta) - c\right| &=& \left|\frac{1}{1 - fe^{i\theta}} - \frac{1}{1 - f^2}\right| \\
&=&\left|\frac{fe^{i\theta} - f^2}{(1 - fe^{i\theta})(1 - f^2)}\right|\\
&=& \frac{|f||e^{i\theta} - f|}{|1 - fe^{i\theta}||1 - f^2|}\\
&=& \frac{|f||e^{i\theta} - f|}{|e^{-i\theta} - f||1 - f^2|}\\
&=& \frac{f}{1 - f^2}\\
\end{eqnarray}
$$

Since this is constant, we conclude that $$\gamma$$ is constrained to live on a
circle of radius $$\frac{f}{1-f^2}$$ centered at $$z = \frac{1}{1-f^2}$$. A little
more thinking allows one to conclude that $$\gamma$$ visits every point on this
circle exactly once as $$\theta$$ runs through $$[0, 2\pi)$$.


### Alternate Approach 
An alternative way to show that the image of $$\gamma$$ is contained in a circle
comes from complex function theory. To that end, I'll note that (for $$f\neq0$$)
the function $$z \mapsto \frac{1}{1 - fz}$$ happens to be a [Möbius
transformation](https://en.wikipedia.org/wiki/M%C3%B6bius_transformation) of the
complex plane. Since Möbius transformations [preserve "generalized
circles"](https://en.wikipedia.org/wiki/M%C3%B6bius_transformation#Preservation_of_angles_and_generalized_circles),
it follows that the image of $$\gamma$$ is either a circle $$\theta \mapsto
e^{i\theta}$$ or a line. Since $$\gamma$$ clearly isn't a line (just consider
the real and imaginary coordinate functions), we can conclude that the image of
$$\gamma$$ is a circle.
