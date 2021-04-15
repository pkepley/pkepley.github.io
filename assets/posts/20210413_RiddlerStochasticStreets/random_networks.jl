### A Pluto.jl notebook ###
# v0.14.2

using Markdown
using InteractiveUtils

# ╔═╡ 14d9371c-9a19-11eb-2c1a-8b680938c549
begin
	using Cairo
	using Compose
	using CSV	
	using LightGraphs
	using GraphPlot
	using StatsPlots
	using DataFrames
	using Statistics
	using Base.Threads
end

# ╔═╡ 7c9d6b8c-68f0-4481-b042-b51e217a8abd
md"""
# Stochastic Streets Riddler Solution

In this post, we'll solve the [Riddler Problem](https://fivethirtyeight.com/features/can-you-navigate-the-one-way-streets/) from April 9<sup>th</th> 2021.

In this problem, we're asked to consider a square gridded city with randomly oriented one way streets, and asked to determine the probability of being able to navigate from the upper left-hand corner of the city to the lower right-hand corner on the road network.

In the original problem statement, we're asked to consider a city 2 blocks across by 2 blocks high... but I will consider cities of arbitrary size. In this notebook, I provide a simulation for arbitrary sized cities, and a lazy exact solution for small cities. 

*Note*: Since it makes notation a bit simpler, I will use $n$ to denote the number of intersections across the city. That is $n= n_\text{blocks} + 1$ where $n_\text{blocks}$ is the width of the city in blocks. 
"""

# ╔═╡ 891b9894-11b0-405f-aa85-232cc635db9a
md"""
## Estimate Probability via Simulation

First, we'll compute the probability that a path exists from the top left-hand corner of the city to the lower right-hand corner of the city via simulation. 
"""

# ╔═╡ 03792d01-268a-451b-8d48-13afdf6f379f
function city_has_path(g, start=1, finish=nv(g))	
	has_path_start_finish = has_path(g, start, finish)
		
	return has_path_start_finish
end

# ╔═╡ 713a8126-0a4d-4373-ad57-6872e6aed059
md"""
### Example Random Street Layouts
"""

# ╔═╡ caf46b55-87cf-4351-9b6a-f729cce80251
md"""
### Simulation Results
"""

# ╔═╡ 5327b953-268a-4b6d-9bf1-ce513f666b56
md"""
## Lazy Analytic Solution (Small Cities)

Now, we'll compute the probability that a path exists from the top left-hand corner of the city to the lower right-hand corner of the city via simulation. We do this in a brute force combinatoric way... by simply enumerating all possible city layouts, and counting how many have the desired path. Since the number of paths grows exponentially in city size, we'll only compute the result for small cities, i.e. $n = 2,3,4$.

There's probably a smarter way to do this... but I couldn't think of it 🙂
"""

# ╔═╡ fd5d8a0c-9a36-11eb-37af-b323787108b5
md"""
## Utility Functions and Package Imports
"""

# ╔═╡ 38abf0ba-c6ea-4f45-acf1-b92eebe462a8
function neighbors(i, j, n)
	ilo = max(1, i-1)
	ihi = min(n, i+1)
	
	jlo = max(1, j-1)
	jhi = min(n, j+1)
	
	return vcat(
		[(i_neighb, j) for i_neighb = ilo:ihi if (i_neighb, j) != (i, j)],
		[(i, j_neighb) for j_neighb = jlo:jhi if (i, j_neighb) != (i, j)]
	)
end

# ╔═╡ b5b7e758-e4de-4666-976b-583a732e8904
function tuple_to_idx(i, j, n)
	return n * (i - 1) + j
end

# ╔═╡ f05db774-9741-475b-a6fc-5df56154faa4
function random_street_graph(n)
	g = SimpleDiGraph(n^2)

	# create set of all adjacent nodes
	adjacencies = Set([Set([(i, j), neighb]) for i = 1:n for j = 1:n for neighb 
						in neighbors(i, j, n)])
		
	for adjacent_pair in adjacencies	
		# unpack nodes and get their indices
		(i1, j1), (i2, j2) = adjacent_pair	
		
		k1 = tuple_to_idx(i1, j1, n)
		k2 = tuple_to_idx(i2, j2, n)
		
		# connect index of node k1 to k2 if 1, else k2 to k1
		direction = rand((0,1))			
		
		# connect node k1 to k2 in the indicated direction
		if direction > 0
			add_edge!(g, k1, k2)
		else
			add_edge!(g, k2, k1)
		end			
	end
	
	return g
end

# ╔═╡ fb2302ca-8b2c-4e23-8dc6-36cc353b16cc
function simulate_city_planning(n, n_simulations)
	rslts = zeros(Bool, n_simulations)
	
	Threads.@threads for i ∈ 1:n_simulations
		g = random_street_graph(n)
		
		has_path = city_has_path(g)
		rslts[i, :] = [has_path]
	end
	
	return DataFrame(has_path=rslts[:,1])
end

# ╔═╡ 285ee664-4c13-4a0b-8c0e-c9b9e5120078
begin 
	n_sim = 10^6
	n_max = 20
	prob_sim_rslts = zeros(n_max - 1)
	
	for n = 2:n_max		
		df_city_planning_sim = simulate_city_planning(n, n_sim)
		prob_sim_rslts[n-1] = sum(df_city_planning_sim[!, :has_path]) / n_sim
	end

	df_prob_sim = DataFrame(city_width = 2:n_max, 
							prob_path = prob_sim_rslts)
end

# ╔═╡ cec180f1-68f3-42bc-a5d1-4a7eeca01ab4
CSV.write("./outputs/prob_path_sim_rslts.csv", df_prob_sim)

# ╔═╡ 6d86c2cc-e62d-46b2-a844-343dbe083eab
bar_plot_ref = @df df_prob_sim bar(
	:city_width,
	:prob_path,
	title="Probability of Navigable Path From Top Left to Bottom Right",
	xlabel="City Width (n)",
	legend=false
)

# ╔═╡ eb45d228-befd-46bc-939d-758fb289fd4a
png(bar_plot_ref, "./outputs/prob_path.png")

# ╔═╡ 377592fd-d9f5-4514-a488-2d9f35c4e822
g = random_street_graph(3)

# ╔═╡ caebbad7-460b-44d3-b6a6-0ff9d4684fe8
begin	
	nn = Int(sqrt(nv(g)))
	
	street_plot = gplot(g, 
		[j for i = 1:nn for j=1:nn],
		[i for i = 1:nn for j=1:nn],
		nodelabel=["$((i-1)*nn+j)" for i = 1:nn for j=1:nn],
	)
end

# ╔═╡ 019727cd-8aaa-4fc5-bd7e-f90b7e3269d5
draw(PNG("./outputs/street_layout_example_1.png", 16cm, 16cm), street_plot)	

# ╔═╡ 3fda5c44-70f3-4202-861d-9c5c4a7415e3
city_has_path(g)

# ╔═╡ 943d0cb8-8c4d-4c4f-9119-7ad84014fc0d
g2 = random_street_graph(3)

# ╔═╡ ccec4661-f080-402d-90c1-0d0ac7238e23
begin	
	nn2 = Int(sqrt(nv(g2)))
	
	street_plot2 = gplot(g2, 
		[j for i = 1:nn2 for j=1:nn2],
		[i for i = 1:nn2 for j=1:nn2],
		nodelabel=["$((i-1)*nn2+j)" for i = 1:nn2 for j=1:nn2],
	)
end

# ╔═╡ 9a95a271-f4be-48e9-9b04-57ae7976dda9
draw(PNG("./outputs/street_layout_example_2.png", 16cm, 16cm), street_plot2)	

# ╔═╡ dede6d7e-362a-49d7-9223-12b16b0bcdf9
city_has_path(g2)

# ╔═╡ 303cac4d-d222-414a-9b58-db2da01c3e9f
function count_connected(n = 3, start=(1,1), finish=(n,n))

	adjacencies = Set([Set([(i, j), neighb]) for i = 1:n for j = 1:n 
					                         for neighb = neighbors(i, j, n)])	
	n_adj = length(adjacencies)
	n_layouts = 2^n_adj
	n_connected = 0
	
	for i_layout = 0:(n_layouts-1)		
		# use the binary representation of i_layout to determine connections
		#  1 represents forward connection
		#  0 represents reverse connection
		layout = [parse(Int, ss) for ss ∈ bitstring(i_layout)[end-n_adj+1:end]]
				
		# create a graph
		g = SimpleDiGraph(n^2)

		# connect the graph
		for (i_adj, adjacent_pair) in enumerate(adjacencies)	
			
			# get the adjacent pair as indices
			(i1, j1), (i2, j2) = adjacent_pair		
			k1 = tuple_to_idx(i1, j1, n)
			k2 = tuple_to_idx(i2, j2, n)			
		
			# get the direction for the connection from k1 to k2 from layout
			direction = layout[i_adj]
			
			# connect node k1 to k2 in the indicated direction
			if direction == 1
				add_edge!(g, k1, k2)
			else
				add_edge!(g, k2, k1)
			end	
		end
		
		# is there a path from start to finish?
		if has_path(g, 1, nv(g))
			n_connected += 1
		end
	end
	
	return n_connected / n_layouts
end

# ╔═╡ 27f9b76a-b998-4fc4-b89d-baee19104f25
begin 
	n_max_analytic = 4
	analytic_rslts = zeros(n_max_analytic - 1)
	
	for n = 2:n_max_analytic
		analytic_rslts[n-1] = count_connected(n)
	end

	df_analytic = DataFrame(city_width = 2:n_max_analytic, 
							prob_path = analytic_rslts)
end


# ╔═╡ 06bb3a39-49aa-42ad-988b-c33671fe1bdb
CSV.write("./outputs/prob_path_analytic_rslts.csv", df_analytic)

# ╔═╡ c2c4c421-8d79-498d-b246-4c1e94f5381b
function idx_to_tuple(k, n)
	i = div((k - 1), n) + 1	
	
	j = mod(k, n)
	if j == 0
		j = n
	end

	return (i, j)
end

# ╔═╡ Cell order:
# ╟─7c9d6b8c-68f0-4481-b042-b51e217a8abd
# ╟─891b9894-11b0-405f-aa85-232cc635db9a
# ╠═f05db774-9741-475b-a6fc-5df56154faa4
# ╠═03792d01-268a-451b-8d48-13afdf6f379f
# ╠═fb2302ca-8b2c-4e23-8dc6-36cc353b16cc
# ╟─713a8126-0a4d-4373-ad57-6872e6aed059
# ╟─377592fd-d9f5-4514-a488-2d9f35c4e822
# ╟─caebbad7-460b-44d3-b6a6-0ff9d4684fe8
# ╟─019727cd-8aaa-4fc5-bd7e-f90b7e3269d5
# ╠═3fda5c44-70f3-4202-861d-9c5c4a7415e3
# ╟─943d0cb8-8c4d-4c4f-9119-7ad84014fc0d
# ╟─ccec4661-f080-402d-90c1-0d0ac7238e23
# ╠═dede6d7e-362a-49d7-9223-12b16b0bcdf9
# ╟─9a95a271-f4be-48e9-9b04-57ae7976dda9
# ╟─caf46b55-87cf-4351-9b6a-f729cce80251
# ╠═285ee664-4c13-4a0b-8c0e-c9b9e5120078
# ╟─cec180f1-68f3-42bc-a5d1-4a7eeca01ab4
# ╟─6d86c2cc-e62d-46b2-a844-343dbe083eab
# ╟─eb45d228-befd-46bc-939d-758fb289fd4a
# ╟─5327b953-268a-4b6d-9bf1-ce513f666b56
# ╠═303cac4d-d222-414a-9b58-db2da01c3e9f
# ╠═27f9b76a-b998-4fc4-b89d-baee19104f25
# ╟─06bb3a39-49aa-42ad-988b-c33671fe1bdb
# ╟─fd5d8a0c-9a36-11eb-37af-b323787108b5
# ╠═38abf0ba-c6ea-4f45-acf1-b92eebe462a8
# ╠═b5b7e758-e4de-4666-976b-583a732e8904
# ╠═c2c4c421-8d79-498d-b246-4c1e94f5381b
# ╠═14d9371c-9a19-11eb-2c1a-8b680938c549
