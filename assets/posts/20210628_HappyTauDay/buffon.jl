### A Pluto.jl notebook ###
# v0.14.5

using Markdown
using InteractiveUtils

# ╔═╡ 32504772-aaef-11eb-0bb0-0b145c5102db
begin
	using Base.Threads
	using Random	
	using Distributions
	using SpecialFunctions
	using Plots
	using StatsPlots
	using Query
	using DataFrames
	using CSV
end

# ╔═╡ ec00bfbc-4889-4fbc-9f5b-ce19b361f1fe
md"""
## Estimating π in Buffon's Needle Problem
First we estimate π many times by simulating Buffon's needle problem. This is repeated for a variety of experimental setups, varying the number of needles thrown (`n_throws`) and the needle length (`needle_length`). For simplicity, we'll just assume that the strip height (`strip_height`) is one - so you can think of the needle length as the ratio of the needle length to the strip height.
"""

# ╔═╡ 7e54380a-fada-40c0-ad20-5795075f2c41
function needle_crossing_fraction(strip_height, needle_length, n_throws)
	D = rand(Uniform(0, strip_height/2), n_throws)
	θ = rand(Uniform(0, π), n_throws)
	
	crosses_line = (needle_length / 2) * sin.(θ) .> D
	n_crossings = sum(crosses_line)
	
	return n_crossings / n_throws
end

# ╔═╡ 3de8036e-723b-4805-9384-f87a6aaae5ba
function buffon_pi_estimate(strip_height, needle_length, n_throws)
	p_hat = needle_crossing_fraction(strip_height, needle_length, n_throws)
	
	return 2 * (needle_length / strip_height) / p_hat
end

# ╔═╡ 9e97dbc2-7d87-40cd-92a8-e892e485d9e6
buffon_pi_estimate(1, 0.1, 10^7)

# ╔═╡ 7838810d-63c0-4de6-8ec7-97a4b65750e2
function estimate_pi_repeatedly(
		n_needle_lengths = 10,
		n_repetitions = 100,
		n_throws_max_exp = 6
	)
	
	# Set up experiment, arrange data so that (when multi-threading) the
	# processors will be running similar problems at similar times 
	df = DataFrame(
		[(needle_length,  n_throws, repetition)
			for n_throws = [10^k for k = 2:n_throws_max_exp] 
			for needle_length = [k/n_needle_lengths for k = 1:n_needle_lengths] 
			for repetition = 1:n_repetitions]
	)
	rename!(df, ["needle_length", "n_throws", "repetition"])
	
	# Number of experiments to run
	n_experiments = nrow(df)
	
	# Run multi-threaded experiments to estimate π
	pi_estimates = zeros(n_experiments)	
	
	Threads.@threads for i ∈ 1:n_experiments
		needle_length = df[i, :needle_length]
		n_throws = df[i, :n_throws]				
		pi_estimates[i] = buffon_pi_estimate(1, needle_length, n_throws)
	end									
	
	df.pi_estimate = pi_estimates
	
	# Evaluate error
	df.error = df.pi_estimate .- π	
	df.abs_error = abs.(df.error)
	
	return df
end

# ╔═╡ bbd5cc5f-80f2-405f-aa71-da0022d74863
pi_estimate_results = estimate_pi_repeatedly(10, 1000, 6)

# ╔═╡ 62e8e764-516a-452a-8f7f-806bf696b126
CSV.write("pi_estimate_results.csv", pi_estimate_results)

# ╔═╡ 27eabc0d-b40f-448f-90ce-301871f3b63b
md"""
## Analyzing the Error in Estimating π
In this section, we take a look at the error committed in estimating π in the various experiments performed above. In particular, we take a look at how the error depends upon the number of needles thrown and how long our needles are. In particular, we take a look at the median error and 95ᵗʰ percentile of our experiments.

In addition, I have computed the theoretical error "bounds" (note this bound is only asymptotically correct / hence more of a guide than a hard and fast "bound"), for 50% and 95% confidence bounds. I didn't bother to plot the actual vs theoretical comparison however, since they're not hard and fast bounds.

I have (however) plotted the observed median and 95ᵗʰ percentile observed error across the experimental set-ups. 
"""

# ╔═╡ 6c17402b-8905-463c-aa0f-3a4905877944
md"""

### Analytical Asymptotic Error Bound
Elsewhere, I computed that the following bound holds asymptotically with probability $$P = 1-\alpha$$ (here, $$\Phi^{-1}$$ denotes the probit function, $$h$$ the strip width, $$\ell$$ the needle length, and $$\hat{\pi}$$ the estimate from throwing needles):

$$\vert \hat{\pi} - \pi \vert \lessapprox \pi  \sqrt{\frac{\pi}{2} - \frac{\ell}{h}} \cdot \Phi^{-1}\left(1 - \frac{\alpha}{2}\right)\cdot \sqrt{\frac{h}{\ell}} \cdot \frac{1}{\sqrt{n_\text{throws}}}.$$

We will compare against this below.
"""

# ╔═╡ d75c194b-20df-4ea8-a415-7c44167271d4
function probit(p)
	sqrt(2) * erfinv(2*p - 1)
end

# ╔═╡ 60f54651-6926-4248-aa40-f135d01e4347
function error_bound(needle_length, strip_width, prob_in_interval, n_throws)
	return π * √(π/2 - (needle_length/ strip_width)) * 
	                    probit(1 - prob_in_interval/2) *
		                √(strip_width / needle_length) * 
	                    1/√(n_throws)
end

# ╔═╡ 3c1ade5a-7a15-4585-8cf2-48b6c84813f7
md"""
The following table shows empirical error bounds, compared against the theoretical approximate bounds.
"""

# ╔═╡ a3304dce-9e87-444d-ab5d-c0f3fffea134
begin
	pi_error_analysis = combine(
		groupby(pi_estimate_results, [:needle_length, :n_throws]), 
		:abs_error => median,	
		:abs_error => (t -> quantile(t, 0.95))
	)
	
	rename!(pi_error_analysis, "abs_error_function" => "abs_error_95_pctile")
		
	transform!(pi_error_analysis, :, [:needle_length, :n_throws] => 
                                     ((a,b) -> error_bound.(a, 1, 0.5, b)) => 
		                             :abs_error_median_theoretical)
	
	transform!(pi_error_analysis, :, [:needle_length, :n_throws] => 
                                     ((a,b) -> error_bound.(a, 1, 0.05, b)) => 
		                             :abs_error_95_pctile_theoretical)
	
	pi_error_analysis
end

# ╔═╡ 902e5796-6741-4c4a-9856-a43006c326ab
CSV.write("pi_error_analysis.csv", pi_error_analysis)

# ╔═╡ 7014ffed-1bed-41aa-95ef-ecdcd366b510
md"""
The following plot shows the empirical median absolute error, compared against the theoretical approximate 50% percent confident bound on error.
"""

# ╔═╡ ab93cbb3-6b82-48d7-8fdd-4c91f300d33c
begin
	plot_ref_50th = pi_error_analysis |>
	@df scatter(
		:n_throws,
		:abs_error_median,
		group=:needle_length,
		color=reshape(palette(:auto)[1:10], (1, 10)),	
		label=reshape(["" for i =1:10], (1,10)),		
		# ugly hack to hide junk entry:
		xaxis=((75, 10^6+5*10^5), :log),
		yaxis=:log
	)
	
	pi_error_analysis |>
	@df plot!(
		:n_throws,
		:abs_error_median_theoretical,
		group=:needle_length,
		#legend=false
		color=reshape(palette(:auto)[1:10], (1, 10)),
		ylabel="Median of Absolute Error",
		xlabel="Number of Needles Thrown",
		title="Median Absolute Error vs Number of Needles Thrown\nby Needle Length",
		titlefontsize=10,				
		legendtitle="Needle Length",
		legendtitlefontsize=8,
		legend = :outertopright
		
	)
	
	# junk data to get legend entries
    plot!([], [], label = " ", color = "white")
    plot!([], [], label = "Theoretical", color = "black")
    scatter!([10], [1], label = "Observed", color="black")	
	
	
	# save figure
	savefig(plot_ref_50th, "error_plot_50pctile.svg")
	
	# display result in Pluto
	plot_ref_50th
end

# ╔═╡ ed32a816-05d8-46f2-b3fe-6a9c5a2f2636
md"""
The following plot shows the empirical 95ᵗʰ percentile of absolute error, compared against the theoretical 95% confident bound on error.
"""

# ╔═╡ a5f76835-73ce-4fa9-a0b0-e63f1f8bff69
begin
	plot_ref_95th = pi_error_analysis |>
	@df scatter(
		:n_throws,
		:abs_error_95_pctile,
		group=:needle_length,
		color=reshape(palette(:auto)[1:10], (1, 10)),	
		label=reshape(["" for i =1:10], (1,10)),		
		# ugly hack to hide junk entry:
		xaxis=((75, 10^6+5*10^5), :log),
		yaxis=:log
	)
	
	pi_error_analysis |>
	@df plot!(
		:n_throws,
		:abs_error_95_pctile_theoretical,
		group=:needle_length,
		#legend=false
		color=reshape(palette(:auto)[1:10], (1, 10)),
		ylabel="95ᵗʰ Percentile of Absolute Error",
		xlabel="Number of Needles Thrown",
		title="95ᵗʰ Percentile of Absolute Error vs Number of Needles Thrown\nby Needle Length",
		titlefontsize=10,				
		legendtitle="Needle Length",
		legendtitlefontsize=8,
		legend = :outertopright
		
	)
	
	# junk data to get legend entries
    plot!([], [], label = " ", color = "white")
    plot!([], [], label = "Theoretical", color = "black")
    scatter!([10], [1], label = "Observed", color="black")	
	
	
	# save figure
	savefig(plot_ref_95th, "error_plot_95pctile.svg")
	
	# display result in Pluto
	plot_ref_95th
end

# ╔═╡ bde8330a-fb98-4950-ad92-c82e2e5e65c6
md"""
### Plotting π Estimates when `needle_length = 1.0`

Since we have a lot of estimates for π, but have only looked at the error we made when estimating them (as opposed to the estimates themselves), I figure I should at least take a look at the estimates in one of the experimental settings.
"""

# ╔═╡ d82dd81c-bf96-443e-8b5a-aa75b21e037e
begin
	df_tmp = filter(row -> row[:needle_length] == 1.0, pi_estimate_results)
	
	plot_ref_len_1 = df_tmp |>
	@df dotplot(
		string.(:n_throws),
		:pi_estimate,
		ylabel="Estimate for π",
		xlabel="Number of Needles Thrown",
		title="Distribution of π Estimates by Number of Needles Thrown\nFor Needle Length=1.0",
		titlefontsize=11,				
		marker=(:lightgrey, stroke(0))		
	)
	
	plot_ref_len_1 = df_tmp |>
	@df boxplot!(
		string.(:n_throws),
		:pi_estimate,
		marker=(:black, stroke(0)),
		fillcolor=:lightblue,
		fillalpha=0.75,
		legend=false
	)
	
	# save figure
	savefig(plot_ref_len_1, "pi_estimate_boxplot.svg")
	
	# show figure
	plot_ref_len_1
end

# ╔═╡ b29276d8-e541-4221-b81f-fde2600a8979
md"""
The following table summarizes the results:
"""

# ╔═╡ 312ba44a-dcad-4b18-b130-3439625f78f3
begin 
	pi_rslt = combine(
		groupby(pi_estimate_results, [:needle_length, :n_throws]), 		
		:pi_estimate => mean => :mean,
		:pi_estimate => minimum => :min,
		:pi_estimate => (t -> quantile(t, 0.25)) => :pctile_25,		
		:pi_estimate => median => :median,
		:pi_estimate => (t -> quantile(t, 0.75)) => :pctile_75,		
		:pi_estimate => maximum => :max,
	) 
end

# ╔═╡ b847e348-4afd-4e63-b91b-84152cbb89b7
md"""
Let's take a look at the `needle_length = 1` case.
"""

# ╔═╡ e2042def-bf39-4b95-bdc9-1d46db79c88e
# show an interesting subset
filter(row -> row[:needle_length] == 1.0, pi_rslt)

# ╔═╡ 9b3f7234-9978-43bb-9af9-55bdf967ed62
# save to file
CSV.write("pi_rslt.csv", pi_rslt)

# ╔═╡ 489c446d-f942-4703-b0d7-7a29c98ce4d5
md"""
## How Many Needles Do I Need to Throw?
Finally, I will use the theoretical 95ᵗʰ percentile error bound to estimate how many needles one needs to throw in order to achieve a specified decimal digit accuracy (with 95% confidence) in estimating π. 
"""

# ╔═╡ aeb3c67c-5248-4312-9930-852259f43de9
function n_throws_required(desired_accuracy, needle_length, strip_width,
		                   prob_in_interval)
	
	p = 1 - prob_in_interval
	
	n_throws =  π^2 * (π/2 - (needle_length / strip_width)) * 
	                  probit(1 - p/2)^2 *
		              (strip_width / needle_length) * 
	                  (1 / desired_accuracy^2)
	
	return n_throws
end

# ╔═╡ b988a3e4-1d15-4abf-8b5a-fc8a2e119c7e
begin 	
	df_required_analytical = DataFrame([
	 (decimal_digits, needle_length, n_throws_required(1/10^decimal_digits,                                                                  needle_length, 1, 0.95))
			for decimal_digits = [1, 2, 3, 4, 5, 6]
			for needle_length = [k/10 for k = 1:10]
	])
	
	rename!(df_required_analytical, ["decimal_digits", "needle_length",                                                    "throws_required"])
end	

# ╔═╡ 55234b47-1b22-4fab-a449-c43b2976b7fa
md"""
Let's take a look at the `needle_length = 1` case.
"""

# ╔═╡ 9668af8a-ecea-4c11-9c3a-f32b416f02a9
# show an interesting subset
filter(row -> row[:needle_length] == 1.0, df_required_analytical)

# ╔═╡ fd88ca22-a191-4e92-900f-c86c7f516641
CSV.write(
	"required_throws_analytical_solution.csv",
	df_required_analytical
)

# ╔═╡ 70b92add-4a58-4181-8409-c896b57665f9
begin
	plot_ref_throws_req = df_required_analytical |>
	@df plot(
		:decimal_digits,
		:throws_required,
		group=:needle_length,		
		yaxis=:log,
		ylabel="Number of Throws Required",
		xlabel="Number of Decimal Digits",
		title="Number of Throws Required to Achieve Specified\nDecimal Digit Accuracy with 95% Confidence\nby Needle Length",
		titlefontsize=11,						
		legendtitle="Needle Length",
		legendtitlefontsize=8,
		legend = :outertopright
	)
	
	# save figure
	savefig(plot_ref_throws_req, "throws_required_95pctile.svg")
	
	# display plot
	plot_ref_throws_req
end

# ╔═╡ Cell order:
# ╟─ec00bfbc-4889-4fbc-9f5b-ce19b361f1fe
# ╠═7e54380a-fada-40c0-ad20-5795075f2c41
# ╠═3de8036e-723b-4805-9384-f87a6aaae5ba
# ╠═9e97dbc2-7d87-40cd-92a8-e892e485d9e6
# ╠═7838810d-63c0-4de6-8ec7-97a4b65750e2
# ╠═bbd5cc5f-80f2-405f-aa71-da0022d74863
# ╠═62e8e764-516a-452a-8f7f-806bf696b126
# ╟─27eabc0d-b40f-448f-90ce-301871f3b63b
# ╟─6c17402b-8905-463c-aa0f-3a4905877944
# ╠═d75c194b-20df-4ea8-a415-7c44167271d4
# ╠═60f54651-6926-4248-aa40-f135d01e4347
# ╟─3c1ade5a-7a15-4585-8cf2-48b6c84813f7
# ╠═a3304dce-9e87-444d-ab5d-c0f3fffea134
# ╠═902e5796-6741-4c4a-9856-a43006c326ab
# ╟─7014ffed-1bed-41aa-95ef-ecdcd366b510
# ╠═ab93cbb3-6b82-48d7-8fdd-4c91f300d33c
# ╟─ed32a816-05d8-46f2-b3fe-6a9c5a2f2636
# ╠═a5f76835-73ce-4fa9-a0b0-e63f1f8bff69
# ╟─bde8330a-fb98-4950-ad92-c82e2e5e65c6
# ╠═d82dd81c-bf96-443e-8b5a-aa75b21e037e
# ╟─b29276d8-e541-4221-b81f-fde2600a8979
# ╠═312ba44a-dcad-4b18-b130-3439625f78f3
# ╟─b847e348-4afd-4e63-b91b-84152cbb89b7
# ╠═e2042def-bf39-4b95-bdc9-1d46db79c88e
# ╠═9b3f7234-9978-43bb-9af9-55bdf967ed62
# ╟─489c446d-f942-4703-b0d7-7a29c98ce4d5
# ╠═aeb3c67c-5248-4312-9930-852259f43de9
# ╠═b988a3e4-1d15-4abf-8b5a-fc8a2e119c7e
# ╟─55234b47-1b22-4fab-a449-c43b2976b7fa
# ╠═9668af8a-ecea-4c11-9c3a-f32b416f02a9
# ╠═fd88ca22-a191-4e92-900f-c86c7f516641
# ╠═70b92add-4a58-4181-8409-c896b57665f9
# ╠═32504772-aaef-11eb-0bb0-0b145c5102db
