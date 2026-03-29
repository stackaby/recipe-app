<script lang="ts">
	import { selectedIngredients, removeIngredient, clearSelected } from '$lib/stores/ingredients';
</script>

<div class="chips-container">
	{#if $selectedIngredients.length > 0}
		<div class="chips-header">
			<span class="count">{$selectedIngredients.length} ingredient{$selectedIngredients.length !== 1 ? 's' : ''}</span>
			<button type="button" class="clear-btn" onclick={clearSelected}>Clear all</button>
		</div>
		<div class="chips">
			{#each $selectedIngredients as ingredient}
				<span class="chip">
					{ingredient}
					<button type="button" class="remove-btn" onclick={() => removeIngredient(ingredient)} aria-label="Remove {ingredient}">×</button>
				</span>
			{/each}
		</div>
	{:else}
		<p class="empty-state">No ingredients selected yet. Start typing above!</p>
	{/if}
</div>

<style>
	.chips-container {
		margin-top: 1.5rem;
	}
	
	.chips-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}
	
	.count {
		font-size: 0.875rem;
		color: #64748b;
	}
	
	.clear-btn {
		background: none;
		border: none;
		color: #ef4444;
		font-size: 0.875rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		transition: background-color 0.15s;
	}
	
	.clear-btn:hover {
		background-color: #fef2f2;
	}
	
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background-color: #f1f5f9;
		border-radius: 9999px;
		font-size: 0.875rem;
		color: #334155;
	}
	
	.remove-btn {
		background: none;
		border: none;
		color: #94a3b8;
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		width: 1.25rem;
		height: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: color 0.15s, background-color 0.15s;
	}
	
	.remove-btn:hover {
		color: #ef4444;
		background-color: #fee2e2;
	}
	
	.empty-state {
		color: #94a3b8;
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem 0;
	}
</style>