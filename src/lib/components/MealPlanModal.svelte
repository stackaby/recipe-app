<script lang="ts">
	import { mealPlan, DAYS, type DayOfWeek } from '$lib/stores/mealPlan';
	import WeekColumn from './WeekColumn.svelte';
	import ShoppingListPanel from './ShoppingListPanel.svelte';
	
	interface Props {
		onclose: () => void;
	}
	
	let { onclose }: Props = $props();
	
	let activeTab = $state<'week' | 'shopping'>('week');
	
	function handleClearWeek() {
		if (confirm('Clear all recipes from the week?')) {
			mealPlan.clearWeek();
		}
	}
</script>

<div class="modal-overlay" onclick={onclose}>
	<div class="modal" role="dialog" aria-modal="true" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2>Meal Plan</h2>
			<button class="close-btn" onclick={onclose} aria-label="Close modal">×</button>
		</div>
		
		<div class="tab-bar">
			<button 
				class="tab-btn" 
				class:active={activeTab === 'week'}
				onclick={() => activeTab = 'week'}
			>
				Week View
			</button>
			<button 
				class="tab-btn" 
				class:active={activeTab === 'shopping'}
				onclick={() => activeTab = 'shopping'}
			>
				Shopping List
			</button>
		</div>
		
		<div class="modal-content">
			{#if activeTab === 'week'}
				<div class="week-view">
					<div class="week-actions">
						<button class="clear-week-btn" onclick={handleClearWeek}>
							Clear Week
						</button>
					</div>
					<div class="week-grid">
						{#each DAYS as day}
							<WeekColumn {day} />
						{/each}
					</div>
					<p class="drag-hint">Drag recipes between days to reorganize</p>
				</div>
			{:else}
				<div class="shopping-view">
					<ShoppingListPanel />
				</div>
			{/if}
		</div>
	</div>
</div>

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
		max-width: 900px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid #e2e8f0;
	}
	
	.modal-header h2 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}
	
	.close-btn {
		background: #f1f5f9;
		border: none;
		font-size: 1.5rem;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #64748b;
		transition: all 0.15s;
	}
	
	.close-btn:hover {
		background: #e2e8f0;
		color: #1e293b;
	}
	
	.tab-bar {
		display: flex;
		border-bottom: 1px solid #e2e8f0;
		padding: 0 1.5rem;
	}
	
	.tab-btn {
		flex: 1;
		padding: 0.75rem;
		border: none;
		background: none;
		font-size: 0.875rem;
		font-weight: 500;
		color: #64748b;
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 0.15s;
	}
	
	.tab-btn:hover {
		color: #334155;
	}
	
	.tab-btn.active {
		color: #3b82f6;
		border-bottom-color: #3b82f6;
	}
	
	.modal-content {
		padding: 1.5rem;
	}
	
	.week-view {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.week-actions {
		display: flex;
		justify-content: flex-end;
	}
	
	.clear-week-btn {
		background: none;
		border: 1px solid #e2e8f0;
		color: #64748b;
		font-size: 0.75rem;
		padding: 0.375rem 0.75rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.clear-week-btn:hover {
		border-color: #ef4444;
		color: #ef4444;
	}
	
	.week-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 0.5rem;
	}
	
	@media (max-width: 768px) {
		.week-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	
	@media (max-width: 480px) {
		.week-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	
	.drag-hint {
		text-align: center;
		font-size: 0.875rem;
		color: #94a3b8;
		margin: 0;
	}
	
	.shopping-view {
		/* ShoppingListPanel has its own styles */
	}
</style>