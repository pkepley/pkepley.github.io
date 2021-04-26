### A Pluto.jl notebook ###
# v0.14.3

using Markdown
using InteractiveUtils

# ╔═╡ 17ada06e-a49a-11eb-29f8-35891d4afe6c
begin
	using Random
	using Plots
	using Base.Threads
	using Distributions
	using DataFrames
end

# ╔═╡ d79fcb85-28ca-4e32-bc4d-8c442b771cd6
md"""
# Random Election Upsets Riddler

This notebook solves the [Riddler Classic problem from April 23rd 2021](https://fivethirtyeight.com/features/can-you-cut-the-perfect-pancake/), which asks us to consider a large nation of voters who independently submit their vote between two candidates (A and B) by flipping identical fair coins. We're asked: if 80% of votes are tallied on election day (regular votes), while the remaining 20% (early votes) are tallied later, what is the probability of an upset -- i.e. what is the probability that the election day outcome doesn't match the final outcome?

As usual, I'll solve this problem in two ways. First I'll compute the result using some gratuitous math, and then I'll run a simulation of the random process to cross-check my analytical results. Since this problem isn't substantially harder if we assume that 20% of votes are submitted early, or that an arbitrary fraction of votes are submitted early, I'll solve the prompt in general and then report the solution for the prompt as a special case.
"""

# ╔═╡ 7c4713bb-7e75-4c0b-815c-e817b71e2f8b
md"""
## Analytical Solution

### Notation
First let's introduce a bit of notation. Throughout, we will use the subscripts $E$ and $R$ to indicate quantities computed respectively for the early voter and regular voter subpopulations. Similarly, we will use a subscript $T$ to refer to the total population. We will use $v$ to denote the number of votes in favor of candidate A in a population and $n$ will denote the number of voters in a population. E.g. $v_E$ is the number of voters who voted for candidate A in the early voter subpopulation, and $n_E$ is the number of voters. Finally, we will use $f$ to denote the fracction of voters who belong to a subpopulation, e.g. $f_E = n_E / n_T$.


### General Solution
Since each voter places their vote by independently flipping a fair coin, the total number of votes for candidate A is distributed as $v_\text{T} \sim \text{Binomial}(n_T,~0.5)$, and this remains true when we sub-divide into regular and early voter sub-populations. That is,

$$\begin{array}{ccl}
v_R &\sim& \text{Binomial}(n_R,~0.5). \\
v_E &\sim& \text{Binomial}(n_E,~0.5), \\
\end{array}$$

The prompt tells us that the population is "large," which is a hint that we should  think about using the Normal approximation to the Binomial. To that end, we recall that if $m \sim \text{Binomial}(n, p)$, then $m$ is approximately $\text{Normal}(\mu_m,\sigma_m)$, where $\mu_m = E[m] = pn$, and $\sigma_m = \sqrt{np(1-p)}$. Hence,

$$\begin{array}{ccl}
v_R &\approx& \text{Normal}(\mu_R,\sigma_R). \\
v_E &\approx& \text{Normal}(\mu_E,\sigma_E), \\
\end{array}$$

where $\mu_R = 0.5n_R$, $\sigma_R = 0.5 \sqrt{n_R}$ and an analogous expressions hold for $\mu_E$ and $\sigma_E$. 

An election upset will occur if candidate A wins the regular vote but loses the total vote, or if candidate A loses the regular vote and wins the total vote. Since both events occur with equal probability (since candidate A and B are interchangeable), it follows that

$$P(\text{upset}) = 2 \cdot P(\text{A wins the regular vote} | \text{A loses the total vote}).$$

We can then re-write this as,

$$\begin{eqnarray}
P(\text{upset}) &=& 2 \cdot P(\text{A wins the regular vote} | \text{A loses the total vote}) \\
&=& 2 \cdot P(v_R > 0.5 \cdot n_R | v_T < 0.5 \cdot n_T)\\
&=& 2 \cdot P(v_R > 0.5 \cdot n_R | v_E + v_R < 0.5 \cdot (n_E + n_R)) \\
&=& 2 \cdot P(v_R > \mu_R | v_E + v_R < \mu_E+\mu_R) \\
&=& 2 \cdot P(v_R > \mu_R | v_E < \mu_E + \mu_R - v_R). \\
\end{eqnarray}$$

Here we have used the fact that candidate A wins a round of votes if $v > 0.5\cdot n$, and used the expressions for $\mu_R, \mu_E$ from above. 

Next, we note that $v_E$ and $v_R$ are independent so their joint density is just the product of their respective densities. Using this obsevation and the fact that both variables are normally distributed we obtain:

$$P(\text{upset}) = 2 \cdot \int_{\mu_R}^\infty \,dv_R \int_{-\infty}^{\mu_R + \mu_E - v_R}\,dv_E 
\frac{e^{-\frac{1}{2}(\frac{v_R-\mu_R}{\sigma_R})^2}}{\sigma_R\sqrt{2\pi}}
\frac{e^{-\frac{1}{2}(\frac{v_E-\mu_E}{\sigma_E})^2}}{\sigma_E\sqrt{2\pi}}.$$

We will now manipulate this expression so that it matches an expression that I managed to find in a table of integrals 🙂. To that end, we make the substitution $w_R = \frac{v_R-\mu_R}{\sigma_R\sqrt{2}}$, $w_E = \frac{v_E -\mu_E}{\sigma_E\sqrt{2}}$, which (after some book-keeping) yields:

$$P(\text{upset}) = 2 \cdot \int_{0}^\infty \,dw_R \frac{e^{-w_R^2}}{\sqrt{\pi}} \int_{-\infty}^{-\frac{\sigma_R}{\sigma_E}w_R}\,dw_E \frac{e^{-w_E^2}}{\sqrt{\pi}}$$

Next, we recall that $$\text{erfc}(x) = \frac{2}{\sqrt{\pi}} \int_x^\infty e^{-t^2}\,dt$$, and that $$\text{erf}(x) = 1 - \text{erfc}(x)$$ so the above can be written:

$$\begin{eqnarray}
P(\text{upset}) &=&\int_{0}^\infty \,dw_R \frac{e^{-w_R^2}}{\sqrt{\pi}} \left(1 - \text{erf}(\frac{\sigma_R}{\sigma_E}w_R)\right)\\
&=&\int_{0}^\infty \,dw_R \frac{e^{-w_R^2}}{\sqrt{\pi}} - \frac{1}{\sqrt{\pi}} \cdot \int_{0}^\infty\,dw_R~e^{-w_R^2} \cdot \text{erf}(\frac{\sigma_R}{\sigma_E}w_R)
\end{eqnarray}$$

The first integral is equal to $\frac{1}{2}\text{erfc}(0) = \frac{1}{2}$. For the second integral, we apply formula 2 from section 4.3 of [this table of integrals involving error functions](https://nvlpubs.nist.gov/nistpubs/jres/73b/jresv73bn1p1_a1b.pdf) with $a = \sigma_R/\sigma_E$ and $b = 1$, to obtain:

$$\begin{eqnarray}
P(\text{upset})&=&\frac{1}{2} - \frac{1}{\sqrt{\pi}} \left[\frac{\sqrt{\pi}}{2} - \frac{1}{\sqrt{\pi}}\tan^{-1}\left(\frac{\sigma_E}{\sigma_R}\right)\right]\\
&=&\frac{1}{\pi}\tan^{-1}\left(\frac{\sigma_E}{\sigma_R}\right)
\end{eqnarray}$$

Finally, since $\sigma_E = \sqrt{\frac{1}{2}f_E\cdot n_\text{total}}$, $\sigma_R = \sqrt{\frac{1}{2}f_R\cdot n_\text{total}}$, and $f_E + f_R = 1$, we conclude that:

$$\boxed{P(\text{upset})=\frac{1}{\pi}\tan^{-1}\left(\sqrt{\frac{f_E}{1-f_E}}\right)}$$

### Solution for the Prompt
In particular, for the case outlined in prompt with $f_E = 0.2$, we find:

$$\boxed{P\left(\text{upset}_\text{prompt}\right) = \frac{1}{\pi} \tan^{-1}\left(\frac{1}{2}\right) \approx 0.14758}$$

"""

# ╔═╡ 70ef11be-81b9-4e4d-b83a-f7a225a9001b
function exact_prob_upset(frac_early)
	return (1/π) * atan(sqrt(frac_early / (1 - frac_early)))
end

# ╔═╡ 24e2efe2-f6f2-4648-8c28-bffedf98095b
exact_prob_upset(0.2)

# ╔═╡ 2383b70b-0693-4adf-99d4-9bcedec5d6cb
md"""
## Simulation Solution

As discussed above, the number of votes for candidate A in the early and regular vote subpopulations are both Binomial random variables. So, we  simulate the election tally by simulating appropriate Binomial random variables. From the simulated results, we next determine if A wins on election night (i.e. if more than 50% of the regular vote is for A) and determine the overall winner (i.e. if more than 50% of the total vote is for A). An election upset results if A wins in either the regular or total tally, but loses in the other tally. We simulate this process 100K times and tally up the fraction of times that an election upset occurred.

This process is repeated for 1001 evenly spaced early voter share fractions in [0,1], and the result is then compared (graphically) against the analytical solution.
"""

# ╔═╡ 562b2637-ec4f-4be2-a525-09e83c6458fa
"""
    simulate_election(frac_early, n_simulations, [n_country, p_A])

	Inputs:
	frac_early - percentage of early voters, 20% in the problem prompt
	n_simulations - number of simulations to run

	Optional:
	n_country - Has to be big-enough™. defaults to 100_001 votes 
	p_A - probability that a voter selects candidate A. defaults to 0.5

	Output:
	estimated probability of an upset to the election night results
"""
function simulate_election(frac_early, n_simulations, n_country = 100_001, p_A=0.5)
	
	# number of early and regular voters
	n_early = floor(Int, frac_early * n_country)
	n_regular = n_country - n_early
	
	# distributions of votes for A for early and regular voters
	d_early = Binomial(n_early, p_A)
	d_regular = Binomial(n_regular, p_A)
	
	# simulate votes for A for early, regular, and total
	n_votes_A_early = rand(d_early, n_simulations)
	n_votes_A_regular = rand(d_regular, n_simulations)
	n_votes_A = n_votes_A_early + n_votes_A_regular
	
	# fraction of vote for A between regular and all votes
	frac_votes_A_regular = n_votes_A_regular / n_regular
	frac_votes_A = n_votes_A / n_country
	
	# determine if A wins on election night and if A wins overall
	a_wins_regular = frac_votes_A_regular .> 0.5
	a_wins = frac_votes_A .> 0.5
	
	# an upset occurs if
	#  1. A wins  regular, but loses overall (i.e. True, False)
	#  2. A loses regular, but wins overall (i.e. False, True)
	upset = a_wins_regular .!= a_wins
	prob_upset = sum(upset) / n_simulations

	return prob_upset
end

# ╔═╡ 5f82ec16-38a7-4c44-aa5a-f76d18d521dd
begin
	n_sim = 100_000
	n_pop = 10_00_001
	frac_earlys = LinRange(0, 1, 1_001)
	
	prob_upset_sim = map(fe->simulate_election(fe, n_sim, n_pop), frac_earlys)
	prob_upset_exact = map(exact_prob_upset, frac_earlys)
end

# ╔═╡ b2346518-43b5-4c4d-9536-244514a4d5a3
plot(
	frac_earlys, 
	hcat(prob_upset_exact, prob_upset_sim), 
	label=["Exact" "Simulated"], 
	legend=:bottomright,
	xlabel="Fraction of Early Voters",
	ylabel="Probability of Election Upset",
	title="Probability of Election Upset \nvs Fraction of Early Voters"
)


# ╔═╡ 06cdba4f-426d-47e5-a4c0-c35f9a41d547
md"""
The above figure shows great agreement between the exact solution discussed above and the simulation results -- so I'd wager that my exact solution is probably correct! 🙂
"""

# ╔═╡ 4a8020c4-b9f4-4c22-8919-eb0f135b1725
savefig("election_upset_probability.png")

# ╔═╡ e1bfd335-b818-4931-8e71-03b46c90c9ec
md"""
### Simulating the Prompt Solution
Finally, we'll simulate the prompt problem 10 million times to get a bit more accuracy in our simulation.
"""

# ╔═╡ e55c8934-7268-4c5f-af6c-2098a48cc094
begin
	Random.seed!(2021)
	simulate_election(0.2, 100_000_000, n_pop)
end

# ╔═╡ 537e2e5d-378b-4676-8ba4-3a50f54eb84c
md"""
Setting the seed for reproducibility (but not selecting it to cherry-pick!), the simulation result agrees with the theoretical result to around four decimal places, which is pretty good!
"""

# ╔═╡ Cell order:
# ╟─d79fcb85-28ca-4e32-bc4d-8c442b771cd6
# ╟─7c4713bb-7e75-4c0b-815c-e817b71e2f8b
# ╠═70ef11be-81b9-4e4d-b83a-f7a225a9001b
# ╠═24e2efe2-f6f2-4648-8c28-bffedf98095b
# ╟─2383b70b-0693-4adf-99d4-9bcedec5d6cb
# ╠═562b2637-ec4f-4be2-a525-09e83c6458fa
# ╠═5f82ec16-38a7-4c44-aa5a-f76d18d521dd
# ╟─b2346518-43b5-4c4d-9536-244514a4d5a3
# ╟─06cdba4f-426d-47e5-a4c0-c35f9a41d547
# ╟─4a8020c4-b9f4-4c22-8919-eb0f135b1725
# ╟─e1bfd335-b818-4931-8e71-03b46c90c9ec
# ╠═e55c8934-7268-4c5f-af6c-2098a48cc094
# ╟─537e2e5d-378b-4676-8ba4-3a50f54eb84c
# ╠═17ada06e-a49a-11eb-29f8-35891d4afe6c
