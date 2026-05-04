import { writable } from 'svelte/store';
import { generateId } from '$lib/utils/id';

interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
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