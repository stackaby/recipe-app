import { writable } from 'svelte/store';

interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
}

function generateId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	// Fallback for older browsers
	return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function createToast() {
	const { subscribe, update } = writable<Toast[]>([]);

	function show(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000) {
		const id = generateId();
		const toast: Toast = { id, message, type };
		
		update(toasts => [...toasts, toast]);
		
		setTimeout(() => {
			update(toasts => toasts.filter(t => t.id !== id));
		}, duration);
	}

	return {
		subscribe,
		success: (message: string) => show(message, 'success'),
		error: (message: string) => show(message, 'error', 4000),
		info: (message: string) => show(message, 'info')
	};
}

export const toast = createToast();