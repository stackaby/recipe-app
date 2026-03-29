<script lang="ts">
	import { findMatchingIngredients, commonIngredients } from '$lib/data/ingredients';
	import { customIngredients, addIngredient, selectedIngredients } from '$lib/stores/ingredients';
	
	let input = $state('');
	let showSuggestions = $state(false);
	let allIngredients = $derived([...commonIngredients, ...$customIngredients]);
	
	let suggestions = $derived(() => {
		const query = input.trim().toLowerCase();
		if (!query || !showSuggestions) return [];
		
		const filtered = allIngredients
			.filter(ing => ing.toLowerCase().includes(query))
			.filter(ing => !$selectedIngredients.includes(ing.toLowerCase()))
			.slice(0, 8);
		
		return filtered;
	});
	
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		input = target.value;
		showSuggestions = true;
	}
	
	function selectSuggestion(suggestion: string) {
		addIngredient(suggestion);
		input = '';
		showSuggestions = false;
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && input.trim()) {
			e.preventDefault();
			addIngredient(input.trim());
			input = '';
			showSuggestions = false;
		} else if (e.key === 'Escape') {
			showSuggestions = false;
		}
	}
	
	function handleBlur() {
		setTimeout(() => {
			showSuggestions = false;
		}, 200);
	}
	
	function handleFocus() {
		if (input.trim()) {
			showSuggestions = true;
		}
	}
</script>

<div class="ingredient-input">
	<div class="input-wrapper">
		<input
			type="text"
			placeholder="Type an ingredient..."
			value={input}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onblur={handleBlur}
			onfocus={handleFocus}
		/>
		
		{#if suggestions().length > 0}
			<ul class="suggestions">
				{#each suggestions() as suggestion}
					<li>
						<button type="button" onclick={() => selectSuggestion(suggestion)}>
							{suggestion}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.ingredient-input {
		position: relative;
		width: 100%;
	}
	
	.input-wrapper {
		position: relative;
	}
	
	input {
		width: 100%;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		outline: none;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}
	
	input:focus {
		border-color: #3b82f6;
	}
	
	input::placeholder {
		color: #94a3b8;
	}
	
	.suggestions {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		margin-top: 4px;
		padding: 0.5rem 0;
		list-style: none;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 10;
		max-height: 300px;
		overflow-y: auto;
	}
	
	.suggestions li {
		margin: 0;
	}
	
	.suggestions button {
		width: 100%;
		padding: 0.5rem 1rem;
		text-align: left;
		background: none;
		border: none;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.15s;
	}
	
	.suggestions button:hover {
		background-color: #f1f5f9;
	}
</style>