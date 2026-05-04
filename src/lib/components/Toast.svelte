<script lang="ts">
	import { toast } from '$lib/stores/toast';
</script>

{#if $toast.length > 0}
	<div class="toast-container">
		{#each $toast as t}
			<div class="toast {t.type}">
				{t.message}
			</div>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.toast {
		padding: 0.875rem 1.25rem;
		border-radius: 8px;
		background: #1e293b;
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		animation: slideIn 0.3s ease-out;
		max-width: 320px;
	}
	
	.toast.success {
		background: #10b981;
	}
	
	.toast.error {
		background: #ef4444;
	}
	
	.toast.info {
		background: #3b82f6;
	}
	
	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>