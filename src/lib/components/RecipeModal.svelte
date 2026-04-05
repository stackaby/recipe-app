<script lang="ts">
	import { savedRecipes, type SavedRecipe } from '$lib/stores/recipes';
	import { modalRecipe, modalLoading, closeRecipeModal } from '$lib/stores/modal';
	
	let showDeleteConfirm = $state(false);
	let imageLoading = $state(false);
	let imageError = $state(false);
	let localImageUrl = $state<string | null>(null);
	
	let lastRecipeId = $state<string | null>(null);
	
	$effect(() => {
		if ($modalRecipe && $modalRecipe.id !== lastRecipeId) {
			lastRecipeId = $modalRecipe.id;
			localImageUrl = $modalRecipe.imageUrl || null;
			imageError = false;
			
			if (!$modalRecipe.imageUrl) {
				generateImage($modalRecipe);
			}
		}
		
		if (!$modalRecipe) {
			lastRecipeId = null;
			localImageUrl = null;
			imageLoading = false;
			imageError = false;
		}
	});
	
	async function generateImage(recipe: SavedRecipe) {
		imageLoading = true;
		imageError = false;
		
		try {
			const response = await fetch('/api/generate-image', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ recipeName: recipe.name })
			});
			
			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.error || 'Failed to generate image');
			}
			
			localImageUrl = data.imageUrl;
			savedRecipes.updateRecipe(recipe.id, { imageUrl: data.imageUrl });
		} catch (e) {
			console.error('Failed to generate image:', e);
			imageError = true;
		} finally {
			imageLoading = false;
		}
	}
	
	function formatTime(minutes: string | number): string {
		const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes;
		if (isNaN(mins)) return 'N/A';
		if (mins < 60) return `${mins} min`;
		const hours = Math.floor(mins / 60);
		const remainingMins = mins % 60;
		return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
	}
	
	function getTotalTime(recipe: SavedRecipe): string {
		if (!recipe) return '';
		const prep = parseInt(recipe.prepTime) || 0;
		const cook = parseInt(recipe.cookTime) || 0;
		return formatTime(prep + cook);
	}
	
	function handleDelete() {
		if ($modalRecipe) {
			savedRecipes.deleteRecipe($modalRecipe.id);
			closeRecipeModal();
		}
		showDeleteConfirm = false;
	}
	
	function handleOverlayClick() {
		showDeleteConfirm = false;
		closeRecipeModal();
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			showDeleteConfirm = false;
			closeRecipeModal();
		}
	}
</script>

{#if $modalRecipe || $modalLoading}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={handleOverlayClick}>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="modal" role="dialog" aria-modal="true" onclick={(e) => e.stopPropagation()} onkeydown={handleKeydown} tabindex="-1">
			{#if $modalLoading}
				<button class="close-btn" onclick={closeRecipeModal} aria-label="Close modal">×</button>
				<div class="loading">
					<div class="spinner"></div>
					<p>Generating your recipe...</p>
				</div>
			{:else if $modalRecipe}
				<div class="modal-header">
					<button class="close-btn" onclick={closeRecipeModal} aria-label="Close modal">×</button>
					{#if !showDeleteConfirm}
						<button class="delete-btn" onclick={() => showDeleteConfirm = true} aria-label="Delete recipe">
							🗑️
						</button>
					{/if}
				</div>
				
				{#if showDeleteConfirm}
					<div class="delete-confirm">
						<p>Delete this recipe?</p>
						<div class="delete-actions">
							<button class="cancel-btn" onclick={() => showDeleteConfirm = false}>Cancel</button>
							<button class="confirm-btn" onclick={handleDelete}>Delete</button>
						</div>
					</div>
				{:else}
					<div class="recipe-image">
						{#if imageLoading}
							<div class="image-placeholder loading-image">
								<div class="spinner-small"></div>
								<span>Generating image...</span>
							</div>
						{:else if localImageUrl}
							<img src={localImageUrl} alt={$modalRecipe.name} />
						{:else if imageError}
							<div class="image-placeholder error-image">
								<span>🍽️</span>
								<button class="retry-btn" onclick={() => $modalRecipe && generateImage($modalRecipe)}>
									Retry Image
								</button>
							</div>
						{:else}
							<div class="image-placeholder">
								<span>🍽️</span>
							</div>
						{/if}
					</div>
					
					<div class="recipe-content">
						<header class="recipe-header">
							<h2>{$modalRecipe.name}</h2>
							<p class="description">{$modalRecipe.description}</p>
							
							<div class="meta">
								<div class="meta-item">
									<span class="meta-label">Prep</span>
									<span class="meta-value">{formatTime($modalRecipe.prepTime)}</span>
								</div>
								<div class="meta-item">
									<span class="meta-label">Cook</span>
									<span class="meta-value">{formatTime($modalRecipe.cookTime)}</span>
								</div>
								<div class="meta-item">
									<span class="meta-label">Total</span>
									<span class="meta-value">{getTotalTime($modalRecipe)}</span>
								</div>
								<div class="meta-item">
									<span class="meta-label">Serves</span>
									<span class="meta-value">{$modalRecipe.servings}</span>
								</div>
							</div>
						</header>
						
						<section class="recipe-section">
							{#if $modalRecipe.availableIngredients?.length > 0}
								<h3>What You Have</h3>
								<ul class="ingredient-list available">
									{#each $modalRecipe.availableIngredients as ingredient}
										<li>
											<span class="check">✓</span>
											{ingredient}
										</li>
									{/each}
								</ul>
								
								{#if $modalRecipe.neededIngredients?.length > 0}
									<h3 class="shopping-title">Shopping List</h3>
									<ul class="ingredient-list needed">
										{#each $modalRecipe.neededIngredients as ingredient}
											<li>
												<span class="plus">+</span>
												{ingredient}
											</li>
										{/each}
									</ul>
								{/if}
							{:else}
								<h3>Ingredients</h3>
								<ul class="ingredient-list">
									{#each $modalRecipe.ingredients as ingredient}
										<li>{ingredient}</li>
									{/each}
								</ul>
							{/if}
						</section>
						
						<section class="recipe-section">
							<h3>Instructions</h3>
							<ol class="instruction-list">
								{#each $modalRecipe.instructions as instruction}
									<li>{instruction}</li>
								{/each}
							</ol>
						</section>
						
						<section class="recipe-section source-ingredients">
							<h4>Made with your ingredients</h4>
							<p class="source-list">{$modalRecipe.sourceIngredients.join(', ')}</p>
						</section>
						
						{#if $modalRecipe.source === 'found' && $modalRecipe.sourceUrl}
							<section class="recipe-section attribution">
								<p class="attribution-text">
									Recipe from <a href={$modalRecipe.sourceUrl} target="_blank" rel="noopener noreferrer">{$modalRecipe.sourceName || 'Spoonacular'} ↗</a>
								</p>
							</section>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 1000;
	}
	
	.modal {
		background: white;
		border-radius: 16px;
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
	}
	
	.modal-header {
		position: sticky;
		top: 0;
		background: white;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 1;
		border-bottom: 1px solid #f1f5f9;
	}
	
	.close-btn, .delete-btn {
		background: #f1f5f9;
		border: none;
		font-size: 1.25rem;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #64748b;
		transition: background-color 0.15s, color 0.15s;
	}
	
	.close-btn:hover {
		background: #e2e8f0;
		color: #1e293b;
	}
	
	.delete-btn:hover {
		background: #fee2e2;
	}
	
	.delete-confirm {
		padding: 3rem 2rem;
		text-align: center;
	}
	
	.delete-confirm p {
		font-size: 1.125rem;
		color: #1e293b;
		margin-bottom: 1.5rem;
	}
	
	.delete-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}
	
	.cancel-btn, .confirm-btn {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.cancel-btn {
		background: #f1f5f9;
		border: none;
		color: #64748b;
	}
	
	.cancel-btn:hover {
		background: #e2e8f0;
	}
	
	.confirm-btn {
		background: #ef4444;
		border: none;
		color: white;
	}
	
	.confirm-btn:hover {
		background: #dc2626;
	}
	
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
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
	
	.spinner-small {
		width: 24px;
		height: 24px;
		border: 2px solid #e2e8f0;
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
	
	.recipe-image {
		width: 100%;
		aspect-ratio: 1;
		background: #f8fafc;
		overflow: hidden;
	}
	
	.recipe-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.image-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
	}
	
	.image-placeholder span:first-child {
		font-size: 3rem;
	}
	
	.loading-image {
		flex-direction: column;
		gap: 0.75rem;
		color: #64748b;
		font-size: 0.875rem;
	}
	
	.error-image {
		background: linear-gradient(135deg, #fef2f2, #fee2e2);
	}
	
	.retry-btn {
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: background-color 0.15s;
	}
	
	.retry-btn:hover {
		background: #2563eb;
	}
	
	.recipe-content {
		padding: 0 2rem 2rem 2rem;
	}
	
	.recipe-header {
		margin-bottom: 2rem;
		margin-top: 1.5rem;
	}
	
	.recipe-header h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}
	
	.description {
		color: #64748b;
		margin: 0 0 1.5rem 0;
		line-height: 1.5;
	}
	
	.meta {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
	}
	
	.meta-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	.meta-label {
		font-size: 0.75rem;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.meta-value {
		font-size: 1rem;
		font-weight: 600;
		color: #1e293b;
	}
	
	.recipe-section {
		margin-bottom: 2rem;
	}
	
	.recipe-section h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #e2e8f0;
	}
	
	.ingredient-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.ingredient-list li {
		padding: 0.5rem 0;
		padding-left: 1.5rem;
		position: relative;
		color: #334155;
		border-bottom: 1px solid #f1f5f9;
	}
	
	.ingredient-list li::before {
		content: '•';
		position: absolute;
		left: 0.5rem;
		color: #3b82f6;
	}
	
	.shopping-title {
		margin-top: 1.5rem !important;
	}
	
	.ingredient-list.available li::before {
		content: none;
	}
	
	.ingredient-list.available .check {
		color: #10b981;
		font-weight: 600;
		margin-right: 0.5rem;
	}
	
	.ingredient-list.needed {
		background: #fef3c7;
		padding: 0.75rem;
		border-radius: 8px;
		margin-top: 0.5rem;
	}
	
	.ingredient-list.needed li::before {
		content: none;
	}
	
	.ingredient-list.needed .plus {
		color: #f59e0b;
		font-weight: 600;
		margin-right: 0.5rem;
	}
	
	.instruction-list {
		padding-left: 1.5rem;
		margin: 0;
	}
	
	.instruction-list li {
		padding: 0.75rem 0;
		color: #334155;
		line-height: 1.6;
	}
	
	.source-ingredients {
		background: #f8fafc;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 0;
	}
	
	.source-ingredients h4 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #64748b;
		margin: 0 0 0.5rem 0;
	}
	
	.source-list {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0;
		line-height: 1.5;
	}
	
	.attribution {
		background: #f0fdf4;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 0;
		border: 1px solid #bbf7d0;
	}
	
	.attribution-text {
		font-size: 0.8125rem;
		color: #166534;
		margin: 0;
	}
	
	.attribution-text a {
		color: #15803d;
		font-weight: 600;
		text-decoration: none;
	}
	
	.attribution-text a:hover {
		text-decoration: underline;
	}
</style>