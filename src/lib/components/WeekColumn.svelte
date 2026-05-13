<script lang="ts">
	import { mealPlan, type DayOfWeek } from '$lib/stores/mealPlan';
	import { savedRecipes } from '$lib/stores/recipes';
	import { openRecipeModal } from '$lib/stores/modal';
	import { mealPlanModalVisible } from '$lib/stores/mealPlan';
	
	interface Props {
		day: DayOfWeek;
	}
	
	let { day }: Props = $props();
	
	let dragOver = $state(false);
	
	const dayLabels: Record<DayOfWeek, string> = {
		monday: 'Mon',
		tuesday: 'Tue',
		wednesday: 'Wed',
		thursday: 'Thu',
		friday: 'Fri',
		saturday: 'Sat',
		sunday: 'Sun'
	};
	
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}
	
	function handleDragLeave() {
		dragOver = false;
	}
	
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		
		const data = e.dataTransfer?.getData('text/plain');
		if (!data) return;
		
		const { recipeId, fromDay } = JSON.parse(data);
		
		if (fromDay === day) return;
		
		if (fromDay) {
			mealPlan.moveRecipe(fromDay as DayOfWeek, day, recipeId);
		} else {
			mealPlan.addRecipe(day, recipeId);
		}
	}
	
	function handleRemove(recipeId: string) {
		mealPlan.removeRecipe(day, recipeId);
	}
	
	function clearDay() {
		mealPlan.clearDay(day);
	}
</script>

<div 
	class="week-column" 
	class:drag-over={dragOver}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="region"
	aria-label="{day} recipes"
>
	<div class="column-header">
		<span class="day-label">{dayLabels[day]}</span>
		{#if $mealPlan.days[day].length > 0}
			<button class="clear-btn" onclick={clearDay} aria-label="Clear {day}">Clear</button>
		{/if}
	</div>
	
	<div class="recipe-list">
		{#each $mealPlan.days[day] as plan (plan.recipeId)}
			{@const recipe = $savedRecipes.find(r => r.id === plan.recipeId)}
			{#if recipe}
				<div 
					class="recipe-card"
					draggable="true"
					ondragstart={(e: DragEvent) => {
						e.dataTransfer?.setData('text/plain', JSON.stringify({ recipeId: recipe.id, fromDay: day }));
					}}
					role="article"
				>
					<span class="recipe-name" onclick={() => { openRecipeModal(recipe); mealPlanModalVisible.set(false); }}>{recipe.name}</span>
					<button class="remove-btn" onclick={() => handleRemove(recipe.id)} aria-label="Remove">×</button>
				</div>
			{/if}
		{/each}
		
		{#if $mealPlan.days[day].length === 0}
			<div class="empty-slot">+</div>
		{/if}
	</div>
</div>

<style>
	.week-column {
		background: #f8fafc;
		border: 2px dashed #e2e8f0;
		border-radius: 8px;
		min-height: 200px;
		transition: all 0.2s;
	}
	
	.week-column.drag-over {
		border-color: #3b82f6;
		background: #eff6ff;
	}
	
	.column-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		border-bottom: 1px solid #e2e8f0;
		background: white;
		border-radius: 6px 6px 0 0;
	}
	
	.day-label {
		font-weight: 600;
		font-size: 0.875rem;
		color: #1e293b;
		text-transform: capitalize;
	}
	
	.clear-btn {
		background: none;
		border: none;
		color: #94a3b8;
		font-size: 0.75rem;
		cursor: pointer;
		padding: 0.125rem 0.375rem;
		border-radius: 3px;
	}
	
	.clear-btn:hover {
		background: #fee2e2;
		color: #ef4444;
	}
	
	.recipe-list {
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.recipe-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		cursor: grab;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.15s;
	}
	
	.recipe-card:hover {
		border-color: #3b82f6;
		box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
	}
	
	.recipe-card:active {
		cursor: grabbing;
	}
	
	.recipe-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: #334155;
		cursor: pointer;
	}

	.recipe-name:hover {
		color: #3b82f6;
	}
	
	.remove-btn {
		background: none;
		border: none;
		color: #94a3b8;
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 0 0 0.5rem;
	}
	
	.remove-btn:hover {
		color: #ef4444;
	}
	
	.empty-slot {
		text-align: center;
		color: #cbd5e1;
		font-size: 1.5rem;
		padding: 2rem;
	}
</style>