<script lang="ts">
	import { goto } from '$app/navigation';
	import IngredientInput from '$lib/components/IngredientInput.svelte';
	import IngredientChips from '$lib/components/IngredientChips.svelte';
	import { selectedIngredients, recipeMode, recipeSource } from '$lib/stores/ingredients';
	
	function findRecipes() {
		if ($selectedIngredients.length > 0) {
			goto('/recipes');
		}
	}
</script>

<svelte:head>
	<title>Recipe Finder</title>
</svelte:head>

<header>
	<h1>What's in your kitchen?</h1>
	<p>Enter the ingredients you have on hand and we'll find recipes for you.</p>
</header>

<section class="input-section">
	<IngredientInput />
	<IngredientChips />
</section>

<section class="toggles-section">
	<div class="toggle-group">
		<label class="toggle-label">Recipe Mode</label>
		<div class="mode-toggle">
			<button 
				class="mode-btn open{$recipeMode === 'open' ? ' active' : ''}" 
				onclick={() => recipeMode.set('open')}
				aria-pressed={$recipeMode === 'open'}
			>
				Open
			</button>
			<button 
				class="mode-btn restrictive{$recipeMode === 'restrictive' ? ' active' : ''}" 
				onclick={() => recipeMode.set('restrictive')}
				aria-pressed={$recipeMode === 'restrictive'}
			>
				Restrictive
			</button>
		</div>
		<p class="toggle-hint">
			{#if $recipeMode === 'open'}
				Suggests additional ingredients to buy
			{:else}
				Uses only what you have (plus pantry staples)
			{/if}
		</p>
	</div>
	
	<div class="toggle-group">
		<label class="toggle-label">Recipe Source</label>
		<div class="source-toggle">
			<button 
				class="source-btn ai{$recipeSource === 'ai' ? ' active' : ''}" 
				onclick={() => recipeSource.set('ai')}
				aria-pressed={$recipeSource === 'ai'}
			>
				AI Generated
			</button>
			<button 
				class="source-btn found{$recipeSource === 'found' ? ' active' : ''}" 
				onclick={() => recipeSource.set('found')}
				aria-pressed={$recipeSource === 'found'}
			>
				Found Recipes
			</button>
		</div>
		<p class="toggle-hint">
			{#if $recipeSource === 'ai'}
				Created by Venice AI
			{:else}
				From Spoonacular database
			{/if}
		</p>
	</div>
</section>

<section class="action-section">
	<button class="find-recipes-btn" disabled={$selectedIngredients.length === 0} onclick={findRecipes}>
		Find Recipes
	</button>
</section>

<style>
	header {
		text-align: center;
		margin-bottom: 2.5rem;
	}
	
	h1 {
		font-size: 2rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 0.5rem 0;
	}
	
	header p {
		font-size: 1rem;
		color: #64748b;
		margin: 0;
	}
	
	.input-section {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
	}
	
	.toggles-section {
		margin-top: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.toggle-group {
		text-align: center;
	}
	
	.toggle-label {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}
	
	.mode-toggle,
	.source-toggle {
		display: inline-flex;
		border-radius: 8px;
		overflow: hidden;
		border: 2px solid #e2e8f0;
		background: white;
	}
	
	.mode-btn,
	.source-btn {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		background: white;
		color: #64748b;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.mode-btn:first-child,
	.source-btn:first-child {
		border-right: 1px solid #e2e8f0;
	}
	
	.mode-btn.open.active {
		background: #3b82f6;
		color: white;
	}
	
	.mode-btn.restrictive.active {
		background: #10b981;
		color: white;
	}
	
	.source-btn.ai.active {
		background: #8b5cf6;
		color: white;
	}
	
	.source-btn.found.active {
		background: #f59e0b;
		color: white;
	}
	
	.mode-btn:hover:not(.active),
	.source-btn:hover:not(.active) {
		background: #f8fafc;
	}
	
	.toggle-hint {
		font-size: 0.75rem;
		color: #94a3b8;
		margin: 0.5rem 0 0 0;
	}
	
	.action-section {
		margin-top: 1.5rem;
		text-align: center;
	}
	
	.find-recipes-btn {
		width: 100%;
		padding: 1rem 2rem;
		font-size: 1.125rem;
		font-weight: 600;
		color: white;
		background: linear-gradient(135deg, #3b82f6, #2563eb);
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: transform 0.15s, box-shadow 0.15s;
	}
	
	.find-recipes-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
	}
	
	.find-recipes-btn:disabled {
		background: #cbd5e1;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
</style>