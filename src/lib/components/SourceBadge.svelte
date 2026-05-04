<script lang="ts">
	interface Props {
		source: 'ai' | 'found';
		variant?: 'full' | 'short';
	}
	
	let { source, variant = 'full' }: Props = $props();
	
	const labels = {
		ai: { full: 'AI Generated', short: 'AI' },
		found: { full: 'Found Recipe', short: 'Found' }
	};
</script>

<span class="source-badge {source}">
	{labels[source][variant]}
</span>

<style>
	.source-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
	}
	
	.source-badge.ai {
		background: #f3e8ff;
		color: #7c3aed;
	}
	
	.source-badge.found {
		background: #e0f2fe;
		color: #0284c7;
	}
</style>