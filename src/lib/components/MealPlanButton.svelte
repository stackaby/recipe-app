<script lang="ts">
	import { mealPlanModalVisible } from '$lib/stores/mealPlan';
</script>

<button class="meal-plan-btn" onclick={() => mealPlanModalVisible.set(true)} aria-label="Open meal plan">
	📅
</button>

<style>
	.meal-plan-btn {
		position: fixed;
		bottom: 5rem;
		right: 1.5rem;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: #10b981;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
		z-index: 99;
		transition: transform 0.15s, box-shadow 0.15s;
	}
	
	.meal-plan-btn:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5);
	}
</style>