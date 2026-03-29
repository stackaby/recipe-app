<script lang="ts">
	import { goto } from '$app/navigation';
	import { savedRecipes, type SavedRecipe } from '$lib/stores/recipes';
	import { openRecipeModal } from '$lib/stores/modal';
	
	function viewRecipe(recipe: SavedRecipe) {
		openRecipeModal(recipe);
	}
	
	function deleteRecipe(id: string, e: Event) {
		e.stopPropagation();
		savedRecipes.deleteRecipe(id);
	}
	
	function goToHome() {
		goto('/');
	}
	
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
	
	function getTotalTime(recipe: SavedRecipe): string {
		const prep = parseInt(recipe.prepTime) || 0;
		const cook = parseInt(recipe.cookTime) || 0;
		const total = prep + cook;
		if (total < 1) return '';
		if (total < 60) return `${total} min`;
		const hours = Math.floor(total / 60);
		const mins = total % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	}
</script>

<svelte:head>
	<title>Saved Recipes</title>
</svelte:head>

<div class="page-content">
	<header>
		<button class="back-btn" onclick={goToHome}>← Back</button>
		<h1>Saved Recipes</h1>
	</header>
	
	{#if $savedRecipes.length === 0}
		<div class="empty-state">
			<p>No saved recipes yet.</p>
			<p class="hint">Generate some recipes to see them here!</p>
		</div>
	{:else}
		<div class="recipes-grid">
			{#each $savedRecipes as recipe}
				<div class="recipe-card" onclick={() => viewRecipe(recipe)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && viewRecipe(recipe)}>
					{#if recipe.imageUrl}
						<div class="card-image">
							<img src={recipe.imageUrl} alt={recipe.name} />
						</div>
					{/if}
					<div class="card-content">
						<h3>{recipe.name}</h3>
						<p class="description">{recipe.description}</p>
						<div class="meta">
							<span class="time">⏱ {getTotalTime(recipe)}</span>
							<span class="servings">🍽 {recipe.servings}</span>
						</div>
						<span class="date">{formatDate(recipe.createdAt)}</span>
					</div>
					<button class="delete-btn" onclick={(e) => deleteRecipe(recipe.id, e)} aria-label="Delete recipe">
						×
					</button>
				</div>
			{/each}
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
		margin: 0;
	}
	
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}
	
	.empty-state p {
		color: #64748b;
		font-size: 1.125rem;
		margin: 0;
	}
	
	.empty-state .hint {
		font-size: 0.875rem;
		margin-top: 0.5rem;
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
		padding: 1.25rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s;
		position: relative;
	}
	
	.recipe-card:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
	}
	
	.card-image {
		width: calc(100% + 2.5rem);
		margin: -1.25rem -1.25rem 1rem -1.25rem;
		height: 140px;
		overflow: hidden;
		border-radius: 10px 10px 0 0;
		background: #f1f5f9;
	}
	
	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.card-content {
		padding-right: 2rem;
	}
	
	.recipe-card h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}
	
	.description {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0 0 0.75rem 0;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.meta {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}
	
	.meta span {
		font-size: 0.75rem;
		color: #64748b;
	}
	
	.date {
		font-size: 0.75rem;
		color: #94a3b8;
	}
	
	.delete-btn {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background: #f1f5f9;
		border: none;
		font-size: 1.25rem;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #64748b;
		transition: background-color 0.15s, color 0.15s;
	}
	
	.delete-btn:hover {
		background: #fee2e2;
		color: #ef4444;
	}
</style>