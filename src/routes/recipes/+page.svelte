<script lang="ts">
	import { goto } from '$app/navigation';
	import { selectedIngredients } from '$lib/stores/ingredients';
	import { savedRecipes } from '$lib/stores/recipes';
	import { modalRecipe, modalLoading, setModalLoading, closeRecipeModal } from '$lib/stores/modal';
	
	interface RecipeOption {
		name: string;
		description: string;
	}
	
	let recipes = $state<RecipeOption[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	
	async function generateRecipes() {
		if ($selectedIngredients.length === 0) {
			goto('/');
			return;
		}
		
		loading = true;
		error = null;
		recipes = [];
		
		try {
			const response = await fetch('/api/generate-recipes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ingredients: $selectedIngredients })
			});
			
			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate recipes');
			}
			
			recipes = data.recipes;
		} catch (e) {
			error = e instanceof Error ? e.message : 'An error occurred';
		} finally {
			loading = false;
		}
	}
	
	async function selectRecipe(recipe: RecipeOption) {
		setModalLoading(true);
		modalRecipe.set(null);
		
		try {
			const response = await fetch('/api/generate-recipe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					recipeName: recipe.name,
					ingredients: $selectedIngredients
				})
			});
			
			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate recipe');
			}
			
			const savedRecipe = savedRecipes.saveRecipe({
				name: data.recipe.name,
				description: data.recipe.description,
				ingredients: data.recipe.ingredients,
				instructions: data.recipe.instructions,
				prepTime: data.recipe.prepTime,
				cookTime: data.recipe.cookTime,
				servings: data.recipe.servings,
				sourceIngredients: [...$selectedIngredients]
			});
			
			modalRecipe.set(savedRecipe);
		} catch (e) {
			closeRecipeModal();
			error = e instanceof Error ? e.message : 'Failed to generate recipe';
		} finally {
			setModalLoading(false);
		}
	}
	
	function goToHome() {
		goto('/');
	}
	
	$effect(() => {
		generateRecipes();
	});
</script>

<svelte:head>
	<title>Recipe Options</title>
</svelte:head>

<div class="page-content">
	<header>
		<button class="back-btn" onclick={goToHome}>← Back</button>
		<h1>Recipe Ideas</h1>
		<p class="subtitle">Based on: {$selectedIngredients.join(', ')}</p>
	</header>
	
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Generating delicious recipes...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>{error}</p>
			<button onclick={generateRecipes}>Try Again</button>
		</div>
	{:else}
		<div class="recipes-grid">
			{#each recipes as recipe}
				<button class="recipe-card" onclick={() => selectRecipe(recipe)}>
					<h3>{recipe.name}</h3>
					<p>{recipe.description}</p>
				</button>
			{/each}
		</div>
		
		<div class="actions">
			<button class="regenerate-btn" onclick={generateRecipes}>
				<span class="icon">🔄</span>
				Generate New Recipes
			</button>
		</div>
	{/if}
</div>

<style>
	.page-content {
		max-width: 800px;
		margin: 0 auto;
	}
	
	header {
		text-align: center;
		margin-bottom: 2rem;
		position: relative;
	}
	
	.back-btn {
		position: absolute;
		left: 0;
		top: 0;
		background: none;
		border: none;
		color: #3b82f6;
		font-size: 1rem;
		cursor: pointer;
		padding: 0.5rem;
		transition: color 0.15s;
	}
	
	.back-btn:hover {
		color: #2563eb;
	}
	
	h1 {
		font-size: 2rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}
	
	.subtitle {
		color: #64748b;
		font-size: 0.875rem;
		margin: 0;
	}
	
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 0;
		gap: 1rem;
	}
	
	.spinner {
		width: 48px;
		height: 48px;
		border: 3px solid #e2e8f0;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.loading p {
		color: #64748b;
		font-size: 1rem;
	}
	
	.error {
		text-align: center;
		padding: 2rem;
	}
	
	.error p {
		color: #ef4444;
		margin-bottom: 1rem;
	}
	
	.error button {
		padding: 0.75rem 1.5rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
	}
	
	.recipes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1rem;
	}
	
	.recipe-card {
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.5rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.recipe-card:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
		transform: translateY(-2px);
	}
	
	.recipe-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}
	
	.recipe-card p {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0;
		line-height: 1.5;
	}
	
	.actions {
		margin-top: 2rem;
		text-align: center;
	}
	
	.regenerate-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		background: white;
		color: #3b82f6;
		border: 2px solid #3b82f6;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.regenerate-btn:hover {
		background: #eff6ff;
	}
	
	.icon {
		font-size: 1.125rem;
	}
</style>