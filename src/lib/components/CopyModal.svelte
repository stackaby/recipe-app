<script lang="ts">
	import { toast } from '$lib/stores/toast';
	
	interface Props {
		text: string;
		onClose: () => void;
	}
	
	let { text, onClose }: Props = $props();
	
	async function handleCopy() {
		try {
			// Try clipboard legacy fallback
			const textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.style.position = 'fixed';
			textarea.style.left = '-9999px';
			document.body.appendChild(textarea);
			textarea.select();
			
			const success = document.execCommand('copy');
			document.body.removeChild(textarea);
			
			if (success) {
				toast.success('Copied to clipboard!');
				onClose();
			} else {
				toast.error('Copy failed. Please select and copy manually.');
			}
		} catch {
			toast.error('Copy failed. Please select and copy manually.');
		}
	}
</script>

<svelte:head>
	<title>Copy Shopping List</title>
</svelte:head>

<div class="modal-overlay" onclick={onClose}>
	<div class="modal" role="dialog" aria-modal="true" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h2>Copy Shopping List</h2>
			<button class="close-btn" onclick={onClose} aria-label="Close">×</button>
		</div>
		
		<div class="modal-content">
			<p class="hint">Select and copy the text below, or tap "Copy" to try again:</p>
			
			<textarea readonly class="copy-text" onclick={(e) => {
				const target = e.currentTarget;
				if (target) target.select();
			}}>{text}</textarea>
			
			<div class="actions">
				<button class="copy-btn" onclick={handleCopy}>
					📋 Copy
				</button>
				<button class="cancel-btn" onclick={onClose}>
					Cancel
				</button>
			</div>
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
		z-index: 1001;
	}
	
	.modal {
		background: white;
		border-radius: 12px;
		width: 100%;
		max-width: 500px;
		max-height: 80vh;
		overflow-y: auto;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid #e2e8f0;
	}
	
	.modal-header h2 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}
	
	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #64748b;
		cursor: pointer;
		padding: 0.25rem;
		line-height: 1;
	}
	
	.close-btn:hover {
		color: #1e293b;
	}
	
	.modal-content {
		padding: 1.5rem;
	}
	
	.hint {
		font-size: 0.875rem;
		color: #64748b;
		margin: 0 0 1rem 0;
	}
	
	.copy-text {
		width: 100%;
		min-height: 200px;
		padding: 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-family: inherit;
		font-size: 0.875rem;
		line-height: 1.5;
		resize: vertical;
		color: #334155;
	}
	
	.copy-text:focus {
		outline: none;
		border-color: #3b82f6;
	}
	
	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}
	
	.copy-btn,
	.cancel-btn {
		flex: 1;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.15s;
	}
	
	.copy-btn {
		background: #3b82f6;
		color: white;
		border: none;
	}
	
	.copy-btn:hover {
		background: #2563eb;
	}
	
	.cancel-btn {
		background: #f1f5f9;
		color: #64748b;
		border: none;
	}
	
	.cancel-btn:hover {
		background: #e2e8f0;
	}
</style>