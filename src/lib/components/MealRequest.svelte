<script lang="ts">
	import { mealRequest, mealRequestText, mealRequestCategories, MEAL_CATEGORIES, type MealCategory } from '$lib/stores/mealRequest';
	
	function toggleCategory(category: MealCategory) {
		mealRequest.toggleCategory(category);
	}
	
	function clearCategories() {
		mealRequest.clearCategories();
	}
</script>

<div class="meal-request">
	<div class="input-section">
		<label for="meal-input">What would you like to cook?</label>
		<input
			id="meal-input"
			type="text"
			placeholder="e.g., Chicken parmesan, Thai curry, pasta..."
			value={$mealRequestText}
			oninput={(e) => mealRequest.setText(e.currentTarget.value)}
		/>
		<p class="hint">Optional — enter a specific dish or type of meal</p>
	</div>
	
	<div class="categories-section">
		<label>Categories</label>
		<p class="hint">Select one or more to narrow down suggestions</p>
		<div class="categories-grid">
			{#each MEAL_CATEGORIES as category}
				<button
					class="category-btn"
					class:selected={$mealRequestCategories.includes(category.id)}
					onclick={() => toggleCategory(category.id)}
				>
					{category.label}
				</button>
			{/each}
		</div>
		{#if $mealRequestCategories.length > 0}
			<button class="clear-btn" onclick={clearCategories}>
				Clear all
			</button>
		{/if}
	</div>
</div>

<style>
	.meal-request {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	
	.input-section label,
	.categories-section label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #334155;
		margin-bottom: 0.5rem;
	}
	
	.input-section input {
		width: 100%;
		padding: 0.875rem 1rem;
		font-size: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		transition: border-color 0.15s, box-shadow 0.15s;
		font-family: inherit;
	}
	
	.input-section input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.input-section input::placeholder {
		color: #94a3b8;
	}
	
	.hint {
		font-size: 0.75rem;
		color: #94a3b8;
		margin: 0.25rem 0 0 0;
	}
	
	.categories-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	
	.category-btn {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		border: 2px solid #e2e8f0;
		border-radius: 20px;
		background: white;
		color: #64748b;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.category-btn:hover {
		border-color: #cbd5e1;
		background: #f8fafc;
	}
	
	.category-btn.selected {
		border-color: #3b82f6;
		background: #eff6ff;
		color: #2563eb;
	}
	
	.clear-btn {
		margin-top: 0.5rem;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		color: #64748b;
		background: none;
		border: none;
		cursor: pointer;
		text-decoration: underline;
	}
	
	.clear-btn:hover {
		color: #475569;
	}
</style>