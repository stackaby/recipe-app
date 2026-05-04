<script lang="ts">
	import RecipeHistory from '$lib/components/RecipeHistory.svelte';
	import RecipeModal from '$lib/components/RecipeModal.svelte';
	import Toast from '$lib/components/Toast.svelte';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍳</text></svg>" />
</svelte:head>

<div class="app">
	<div class="container">
		<RecipeHistory />
		<main>
			{@render children()}
		</main>
	</div>
</div>

<RecipeModal />
<Toast />

<style>
	.app {
		min-height: 100vh;
		background: linear-gradient(to bottom, #f8fafc, #ffffff);
	}
	
	.container {
		padding: 2rem 1.5rem 3rem;
	}
	
	main {
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}
	
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	
	:global(html) {
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
	
	:global(body) {
		background-color: #f8fafc;
		color: #1e293b;
		line-height: 1.5;
	}
	
	:global(button) {
		font-family: inherit;
	}
	
	:global(input) {
		font-family: inherit;
	}
	
	:global(.page-content) {
		max-width: 800px;
		margin: 0 auto;
	}
</style>