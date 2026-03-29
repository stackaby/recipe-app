<script lang="ts">
	import { goto } from '$app/navigation';
	import IngredientInput from '$lib/components/IngredientInput.svelte';
	import IngredientChips from '$lib/components/IngredientChips.svelte';
	import { selectedIngredients } from '$lib/stores/ingredients';
	
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