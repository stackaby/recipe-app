import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface TimerState {
	seconds: number;
	initialDuration: number;
	status: 'idle' | 'running' | 'paused';
	position: { x: number; y: number };
	visible: boolean;
	beeping: boolean;
}

const STORAGE_KEY = 'timerPosition';
const DEFAULT_POSITION = { x: -20, y: -80 };

function getDefaultState(): TimerState {
	let position = DEFAULT_POSITION;
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				position = JSON.parse(stored);
			} catch {
				position = DEFAULT_POSITION;
			}
		}
	}
	return {
		seconds: 0,
		initialDuration: 0,
		status: 'idle',
		position,
		visible: false,
		beeping: false
	};
}

function createTimerStore() {
	const store = writable<TimerState>(getDefaultState());
	let interval: ReturnType<typeof setInterval> | null = null;
	let beepInterval: ReturnType<typeof setInterval> | null = null;
	let beepTimeout: ReturnType<typeof setTimeout> | null = null;

	function clearTimer() {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	function clearBeep() {
		if (beepInterval) {
			clearInterval(beepInterval);
			beepInterval = null;
		}
		if (beepTimeout) {
			clearTimeout(beepTimeout);
			beepTimeout = null;
		}
	}

	function playBeep() {
		if (!browser) return;
		try {
			const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();
			
			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);
			
			oscillator.frequency.value = 880;
			oscillator.type = 'sine';
			
			gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
			
			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + 0.5);
		} catch (e) {
			console.error('Failed to play beep:', e);
		}
	}

	function startBeeping() {
		playBeep();
		beepInterval = setInterval(playBeep, 1000);
		beepTimeout = setTimeout(() => {
			clearBeep();
			store.update(s => ({ ...s, beeping: false }));
		}, 20000);
	}

	return {
		subscribe: store.subscribe,

		setDuration(seconds: number) {
			clearBeep();
			store.update(s => ({
				...s,
				seconds,
				initialDuration: seconds,
				status: 'idle'
			}));
		},

		start() {
			store.update(s => {
				if (s.seconds <= 0) return s;
				return { ...s, status: 'running' };
			});

			clearTimer();
			interval = setInterval(() => {
				store.update(s => {
					if (s.status !== 'running') return s;
					if (s.seconds <= 1) {
						clearTimer();
						startBeeping();
						return { ...s, status: 'idle', seconds: 0, beeping: true };
					}
					return { ...s, seconds: s.seconds - 1 };
				});
			}, 1000);
		},

		pause() {
			clearTimer();
			store.update(s => ({ ...s, status: 'paused' }));
		},

		resume() {
			store.update(s => ({ ...s, status: 'running' }));
			clearTimer();
			interval = setInterval(() => {
				store.update(s => {
					if (s.status !== 'running') return s;
					if (s.seconds <= 1) {
						clearTimer();
						startBeeping();
						return { ...s, status: 'idle', seconds: 0, beeping: true };
					}
					return { ...s, seconds: s.seconds - 1 };
				});
			}, 1000);
		},

		reset() {
			clearBeep();
			store.update(s => ({
				...s,
				seconds: s.initialDuration,
				status: 'idle',
				beeping: false
			}));
		},

		stopBeep() {
			clearBeep();
			store.update(s => ({ ...s, beeping: false }));
		},

		setPosition(x: number, y: number) {
			store.update(s => {
				const newPosition = { x, y };
				if (browser) {
					localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosition));
				}
				return { ...s, position: newPosition };
			});
		},

		setVisible(visible: boolean) {
			if (!visible) clearBeep();
			store.update(s => ({ ...s, visible }));
		},

		toggleVisibility() {
			store.update(s => ({ ...s, visible: !s.visible }));
		}
	};
}

export const timer = createTimerStore();

export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function parseTimeInput(input: string): number {
	const match = input.match(/^(?:(\d+):)?(\d+)$/);
	if (!match) {
		const mins = parseInt(input, 10);
		if (!isNaN(mins)) return mins * 60;
		return 0;
	}
	const mins = match[1] ? parseInt(match[1], 10) : 0;
	const secs = parseInt(match[2], 10);
	return mins * 60 + secs;
}