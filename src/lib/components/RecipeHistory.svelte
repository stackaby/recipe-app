<script lang="ts">
	import { goto } from '$app/navigation';
	import { savedRecipes, type SavedRecipe } from '$lib/stores/recipes';
	import { openRecipeModal } from '$lib/stores/modal';
	
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
	
	function viewRecipe(recipe: SavedRecipe) {
		openRecipeModal(recipe);
	}
	
	function viewAll() {
		goto('/saved');
	}
</script>

{#if $savedRecipes.length > 0}
	<section class="history-section">
		<div class="history-header">
			<h2>Recent Recipes</h2>
			<button class="view-all-btn" onclick={viewAll}>View All →</button>
		</div>
		
		<div class="carousel">
			{#each $savedRecipes.slice(0, 5) as recipe}
				<button class="recipe-card" onclick={() => viewRecipe(recipe)}>
					{#if recipe.imageUrl}
						<div class="card-image">
							<img src={recipe.imageUrl} alt={recipe.name} />
						</div>
					{:else}
						<div class="card-icon">🍽️</div>
					{/if}
					<div class="card-content">
						<h3>{recipe.name}</h3>
						{#if recipe.source === 'ai'}
							<span class="source-tag ai">AI</span>
						{/if}
						<span class="card-time">{getTotalTime(recipe)}</span>
					</div>
				</button>
			{/each}
		</div>
	</section>
{/if}

<style>
	.history-section {
		margin-bottom: 2rem;
	}
	
	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	
	.history-header h2 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}
	
	.view-all-btn {
		background: none;
		border: none;
		color: #3b82f6;
		font-size: 0.875rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		transition: background-color 0.15s;
	}
	
	.view-all-btn:hover {
		background: #eff6ff;
	}
	
	.carousel {
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 transparent;
	}
	
	.carousel::-webkit-scrollbar {
		height: 6px;
	}
	
	.carousel::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.carousel::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 3px;
	}
	
	.recipe-card {
		flex: 0 0 auto;
		width: 140px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.recipe-card:hover {
		border-color: #3b82f6;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
		transform: translateY(-2px);
	}
	
	.card-icon {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}
	
	.card-image {
		width: 100%;
		height: 80px;
		border-radius: 8px;
		overflow: hidden;
		margin-bottom: 0.5rem;
		background: #f1f5f9;
	}
	
	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.card-content h3 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.25rem 0;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.card-time {
		font-size: 0.75rem;
		color: #64748b;
	}
	
	.source-tag.ai {
		display: inline-block;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 500;
		margin-right: 0.5rem;
		background: #f3e8ff;
		color: #7c3aed;
	}
</style>