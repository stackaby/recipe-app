<script lang="ts">
	import { timer, formatTime, parseTimeInput } from '$lib/stores/timer';
	
	let value = $state('');
	let isDragging = $state(false);
	let dragStart = $state({ x: 0, y: 0 });
	let panelStart = $state({ x: 0, y: 0 });
	
	function handlePreset(minutes: number) {
		value = `${minutes}:00`;
		timer.setDuration(minutes * 60);
	}
	
	function handleInput() {
		const seconds = parseTimeInput(value);
		if (seconds > 0) {
			timer.setDuration(seconds);
		}
	}
	
	function handleStart() {
		if ($timer.seconds > 0) {
			timer.start();
		}
	}
	
	function handleMouseDown(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.timer-header')) {
			isDragging = true;
			dragStart = { x: e.clientX, y: e.clientY };
			panelStart = { ...$timer.position };
		}
	}
	
	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		const deltaX = e.clientX - dragStart.x;
		const deltaY = e.clientY - dragStart.y;
		timer.setPosition(panelStart.x + deltaX, panelStart.y + deltaY);
	}
	
	function handleMouseUp() {
		isDragging = false;
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleInput();
		}
	}
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<button class="timer-trigger" onclick={() => timer.toggleVisibility()} aria-label="Timer">
	<span class="icon">⏱</span>
</button>

{#if $timer.visible}
	<div
		class="timer-panel"
		class:dragging={isDragging}
		style="transform: translate({$timer.position.x}px, {$timer.position.y}px)"
		onmousedown={handleMouseDown}
	>
		<div class="timer-header">
			<span class="drag-handle">⋮⋮</span>
			<span class="title">Timer</span>
			<button class="close-btn" onclick={() => timer.setVisible(false)} aria-label="Close timer">×</button>
		</div>
		
		<div class="timer-display" class:beeping={$timer.beeping}>
			{formatTime($timer.seconds)}
		</div>
		
		<div class="timer-input-section">
			<input
				type="text"
				placeholder="mm:ss or mins"
				bind:value
				onblur={handleInput}
				onkeydown={handleKeydown}
				disabled={$timer.status !== 'idle'}
			/>
		</div>
		
		<div class="presets">
			<button onclick={() => handlePreset(5)}>5m</button>
			<button onclick={() => handlePreset(10)}>10m</button>
			<button onclick={() => handlePreset(15)}>15m</button>
			<button onclick={() => handlePreset(30)}>30m</button>
		</div>
		
		<div class="timer-controls">
			{#if $timer.beeping}
				<button class="btn danger" onclick={() => timer.stopBeep()}>
					Stop
				</button>
			{:else if $timer.status === 'idle'}
				<button class="btn primary" onclick={handleStart} disabled={$timer.seconds === 0}>
					Start
				</button>
			{:else if $timer.status === 'running'}
				<button class="btn secondary" onclick={() => timer.pause()}>
					Pause
				</button>
			{:else if $timer.status === 'paused'}
				<button class="btn primary" onclick={() => timer.resume()}>
					Resume
				</button>
			{/if}
			
			{#if !$timer.beeping}
				<button class="btn secondary" onclick={() => timer.reset()} disabled={$timer.status === 'idle'}>
					Reset
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.timer-trigger {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: #3b82f6;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
		z-index: 100;
		transition: transform 0.15s, box-shadow 0.15s;
	}
	
	.timer-trigger:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
	}
	
	.timer-trigger .icon {
		font-size: 1.5rem;
	}
	
	.timer-panel {
		position: fixed;
		bottom: 6rem;
		right: 1.5rem;
		width: 280px;
		background: white;
		border-radius: 16px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		z-index: 1001;
		overflow: hidden;
		transition: transform 0.1s;
	}
	
	.timer-panel.dragging {
		transition: none;
		cursor: grabbing;
	}
	
	.timer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: #f8fafc;
		cursor: grab;
		user-select: none;
	}
	
	.timer-header:active {
		cursor: grabbing;
	}
	
	.drag-handle {
		color: #94a3b8;
		font-size: 0.75rem;
		letter-spacing: 2px;
	}
	
	.title {
		font-weight: 600;
		color: #1e293b;
	}
	
	.close-btn {
		background: none;
		border: none;
		font-size: 1.25rem;
		color: #64748b;
		cursor: pointer;
		padding: 0;
		line-height: 1;
	}
	
	.close-btn:hover {
		color: #1e293b;
	}
	
	.timer-display {
		padding: 1.5rem;
		text-align: center;
		font-size: 3rem;
		font-weight: 700;
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
		color: #1e293b;
		letter-spacing: 2px;
	}
	
	.timer-display.beeping {
		animation: pulse 0.5s ease-in-out infinite;
		color: #ef4444;
	}
	
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}
	
	.timer-input-section {
		padding: 0 1rem;
		margin-bottom: 0.75rem;
	}
	
	.timer-input-section input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		font-size: 0.875rem;
		text-align: center;
		font-family: inherit;
	}
	
	.timer-input-section input:focus {
		outline: none;
		border-color: #3b82f6;
	}
	
	.timer-input-section input:disabled {
		background: #f8fafc;
		color: #64748b;
	}
	
	.presets {
		display: flex;
		gap: 0.5rem;
		padding: 0 1rem;
		margin-bottom: 1rem;
	}
	
	.presets button {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #e2e8f0;
		background: white;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.presets button:hover {
		background: #f1f5f9;
		border-color: #cbd5e1;
	}
	
	.timer-controls {
		display: flex;
		gap: 0.5rem;
		padding: 0 1rem 1rem;
	}
	
	.btn {
		flex: 1;
		padding: 0.75rem;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s;
	}
	
	.btn.primary {
		background: #3b82f6;
		color: white;
	}
	
	.btn.primary:hover:not(:disabled) {
		background: #2563eb;
	}
	
	.btn.secondary {
		background: #f1f5f9;
		color: #475569;
	}
	
	.btn.secondary:hover:not(:disabled) {
		background: #e2e8f0;
	}
	
	.btn.danger {
		background: #ef4444;
		color: white;
	}
	
	.btn.danger:hover {
		background: #dc2626;
	}
	
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>