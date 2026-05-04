<script lang="ts">
	interface Props {
		size?: 'small' | 'medium' | 'large';
	}
	
	let { size = 'medium' }: Props = $props();
	
	const sizeMap = {
		small: '24px',
		medium: '48px',
		large: '64px'
	};
</script>

<div class="spinner" style="width: {sizeMap[size]}; height: {sizeMap[size]}"></div>

<style>
	.spinner {
		border: 3px solid #e2e8f0;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>