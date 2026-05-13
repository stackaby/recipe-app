<script lang="ts">
	import { shoppingList, shoppingListStore, customShoppingItems, customItemsStore } from '$lib/stores/shoppingList';
	import { shareOrCopy } from '$lib/utils/clipboard';
	import { toast } from '$lib/stores/toast';
	
	let newItemName = $state('');
	let newItemQuantity = $state(1);
	
	function toggleAvailable(item: typeof $shoppingList[0]) {
		shoppingListStore.markAvailable(item.name, !item.available);
	}
	
	function addCustomItem() {
		const name = newItemName.trim();
		if (!name) return;
		
		customItemsStore.addItem(name, newItemQuantity);
		newItemName = '';
		newItemQuantity = 1;
	}
	
	function formatList(): string {
		const lines: string[] = ['Shopping List\n'];
		
		const toBuy = $shoppingList.filter(i => !i.available);
		const available = $shoppingList.filter(i => i.available);
		const customUnchecked = $customShoppingItems.filter((i: { checked: boolean }) => !i.checked);
		const customChecked = $customShoppingItems.filter((i: { checked: boolean }) => i.checked);
		
		if (toBuy.length > 0) {
			lines.push('Need to Buy:');
			for (const item of toBuy) {
				lines.push(`□ ${item.displayText}`);
				if (item.recipes.length > 1) {
					lines.push(`  (for: ${item.recipes.join(', ')})`);
				}
			}
		}
		
		if (customUnchecked.length > 0) {
			if (toBuy.length > 0) lines.push('');
			lines.push('Custom Items:');
			for (const item of customUnchecked) {
				lines.push(`□ ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}`);
			}
		}
		
		if (available.length > 0 || customChecked.length > 0) {
			lines.push('\nAlready Have:');
			for (const item of available) {
				lines.push(`☑ ${item.displayText}`);
			}
			for (const item of customChecked) {
				lines.push(`☑ ${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}`);
			}
		}
		
		return lines.join('\n');
	}
	
	async function handleExport() {
		const text = formatList();
		const result = await shareOrCopy('Shopping List', text);
		
		if (result === 'shared') {
		} else if (result === 'copied') {
			toast.success('Copied to clipboard!');
		}
	}
</script>

<div class="shopping-list">
	<div class="list-header">
		<h3>Shopping List</h3>
		<div class="header-actions">
			<button class="export-btn" onclick={handleExport}>
				Export
			</button>
		</div>
	</div>
	
	{#if $shoppingList.length > 0}
		<div class="list-sections">
			{#if $shoppingList.filter(i => !i.available).length > 0}
				<section class="list-section">
					<h4>Need to Buy</h4>
					<ul class="item-list">
						{#each $shoppingList.filter(i => !i.available) as item (item.name)}
							<li class="item" onclick={() => toggleAvailable(item)}>
								<span class="checkbox">□</span>
								<span class="item-text">
									<span class="item-name">{item.displayText}</span>
									{#if item.recipes.length > 1}
										<span class="item-recipes">for: {item.recipes.join(', ')}</span>
									{/if}
								</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
			
			{#if $shoppingList.filter(i => i.available).length > 0}
				<section class="list-section available">
					<h4>Already Have</h4>
					<ul class="item-list">
						{#each $shoppingList.filter(i => i.available) as item (item.name)}
							<li class="item checked" onclick={() => toggleAvailable(item)}>
								<span class="checkbox">☑</span>
								<span class="item-text">
									<span class="item-name">{item.displayText}</span>
								</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</div>
	{/if}
	
	<section class="custom-section">
		<h4>Custom Items</h4>
		<div class="add-item-form">
			<input
				type="text"
				placeholder="Add item..."
				bind:value={newItemName}
				onkeydown={(e) => e.key === 'Enter' && addCustomItem()}
			/>
			<input
				type="number"
				min="1"
				max="99"
				bind:value={newItemQuantity}
				class="qty-input"
			/>
			<button class="add-btn" onclick={addCustomItem}>+</button>
		</div>
		
		{#if $customShoppingItems.length > 0}
			<ul class="item-list">
				{#each $customShoppingItems as item (item.id)}
					<li class="item" class:checked={item.checked}>
						<span class="checkbox" onclick={() => customItemsStore.toggleChecked(item.id)}>
							{item.checked ? '☑' : '□'}
						</span>
						<span class="item-name">
							{item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
						</span>
						<button class="remove-btn" onclick={() => customItemsStore.removeItem(item.id)}>×</button>
					</li>
				{/each}
			</ul>
		{:else if $shoppingList.length === 0}
			<p class="empty-state">Add recipes to your week or add custom items above.</p>
		{/if}
	</section>
</div>

<style>
	.shopping-list {
		background: white;
		border-radius: 12px;
		padding: 1rem;
		max-height: 400px;
		overflow-y: auto;
	}
	
	.list-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	
	.list-header h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}
	
	.header-actions {
		display: flex;
		gap: 0.5rem;
	}
	
	.export-btn {
		background: #eff6ff;
		border: 1px solid #3b82f6;
		color: #2563eb;
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.375rem 0.75rem;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.export-btn:hover {
		background: #3b82f6;
		color: white;
	}
	
	.empty-state {
		text-align: center;
		padding: 1rem;
		color: #94a3b8;
		font-size: 0.875rem;
	}
	
	.list-sections {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	
	.list-section h4 {
		font-size: 0.75rem;
		font-weight: 600;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.5rem 0;
	}
	
	.list-section.available h4 {
		color: #94a3b8;
	}
	
	.custom-section {
		border-top: 1px solid #e2e8f0;
		padding-top: 1rem;
		margin-top: 0.5rem;
	}
	
	.custom-section > h4 {
		font-size: 0.75rem;
		font-weight: 600;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.5rem 0;
	}
	
	.add-item-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	
	.add-item-form input[type="text"] {
		flex: 1;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.15s;
	}
	
	.add-item-form input[type="text"]:focus {
		border-color: #3b82f6;
	}
	
	.qty-input {
		width: 3.5rem;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		padding: 0.5rem;
		font-size: 0.875rem;
		text-align: center;
		outline: none;
		transition: border-color 0.15s;
	}
	
	.qty-input:focus {
		border-color: #3b82f6;
	}
	
	.add-btn {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		padding: 0.5rem 1rem;
		font-size: 1.25rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}
	
	.add-btn:hover {
		background: #2563eb;
	}
	
	.item-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	.item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.15s;
	}
	
	.item:hover {
		background: #f8fafc;
	}
	
	.item.checked {
		opacity: 0.6;
	}
	
	.checkbox {
		font-size: 1rem;
		line-height: 1.2;
		color: #94a3b8;
		user-select: none;
	}
	
	.item.checked .checkbox {
		color: #10b981;
	}
	
	.item-text {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	
	.item-name {
		flex: 1;
		font-size: 0.875rem;
		color: #334155;
	}
	
	.item.checked .item-name {
		text-decoration: line-through;
		color: #94a3b8;
	}
	
	.item-recipes {
		font-size: 0.75rem;
		color: #94a3b8;
	}
	
	.remove-btn {
		background: none;
		border: none;
		color: #94a3b8;
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		padding: 0;
		margin-left: auto;
		transition: color 0.15s;
	}
	
	.remove-btn:hover {
		color: #ef4444;
	}
</style>