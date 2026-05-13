<script lang="ts">
	import { mealPlan, type DayOfWeek, DAYS } from '$lib/stores/mealPlan';
	import { savedRecipes } from '$lib/stores/recipes';
	
	interface Props {
		recipeId: string;
	}
	
	let { recipeId }: Props = $props();
	
	let showPicker = $state(false);
	
	function getDayCounts(): Record<DayOfWeek, number> {
		const counts: Record<DayOfWeek, number> = {
			monday: 0,
			tuesday: 0,
			wednesday: 0,
			thursday: 0,
			friday: 0,
			saturday: 0,
			sunday: 0
		};
		for (const day of DAYS) {
			counts[day] = $mealPlan.days[day].length;
		}
		return counts;
	}
	
	function isRecipeInDay(day: DayOfWeek): boolean {
		return $mealPlan.days[day].some(p => p.recipeId === recipeId);
	}
	
	function addToday(day: DayOfWeek) {
		mealPlan.addRecipe(day, recipeId);
		showPicker = false;
	}
	
	function togglePicker() {
		showPicker = !showPicker;
	}
	
	function handleClickOutside(e: MouseEvent) {
		if (showPicker && !(e.target as HTMLElement).closest('.add-to-week-container')) {
			showPicker = false;
		}
	}
	
	function isAdded(): boolean {
		return DAYS.some(day => $mealPlan.days[day].some(p => p.recipeId === recipeId));
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="add-to-week-container">
	<button 
		class="add-btn" 
		class:added={isAdded()}
		onclick={togglePicker} 
		aria-label="Add to meal plan"
	>
		{isAdded() ? '✓ W' : '+ W'}
	</button>
	
	{#if showPicker}
		<div class="day-picker">
			<div class="picker-header">Add to Week</div>
			<div class="day-buttons">
				{#each DAYS as day}
					<button 
						class="day-btn" 
						class:has-recipe={isRecipeInDay(day)}
						onclick={() => addToday(day)}
					>
						<span class="day-name">
							{isRecipeInDay(day) ? '✓' : ''}{day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}
						</span>
						<span class="day-count">{getDayCounts()[day]}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.add-to-week-container {
		position: relative;
	}
	
	.add-btn {
		background: #f1f5f9;
		border: none;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		cursor: pointer;
		color: #64748b;
		transition: all 0.15s;
	}
	
	.add-btn:hover {
		background: #dbeafe;
		color: #2563eb;
	}
	
	.add-btn.added {
		background: #dcfce7;
		color: #16a34a;
	}
	
	.add-btn.added:hover {
		background: #bbf7d0;
	}
	
	.day-picker {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 0.5rem;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		z-index: 100;
		padding: 0.75rem;
		min-width: 280px;
	}
	
	.picker-header {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1e293b;
		margin-bottom: 0.5rem;
		text-align: center;
	}
	
	.day-buttons {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}
	
	.day-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		background: white;
		cursor: pointer;
		min-width: 36px;
		transition: all 0.15s;
	}
	
	.day-btn:hover {
		background: #eff6ff;
		border-color: #3b82f6;
	}
	
	.day-btn.has-recipe {
		background: #f0fdf4;
		border-color: #22c55e;
	}
	
	.day-btn.has-recipe:hover {
		background: #dcfce7;
	}
	
	.day-name {
		font-size: 0.75rem;
		font-weight: 600;
		color: #334155;
	}
	
	.day-btn.has-recipe .day-name {
		color: #16a34a;
	}
	
	.day-count {
		font-size: 0.625rem;
		color: #94a3b8;
	}
</style>