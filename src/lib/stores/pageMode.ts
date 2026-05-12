import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type PageMode = 'ingredients' | 'request';

const STORAGE_KEY = 'pageMode';

function createPageModeStore() {
	const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
	const initial: PageMode = (stored as PageMode) || 'request';
	
	const store = writable<PageMode>(initial);
	
	if (browser) {
		store.subscribe(value => {
			localStorage.setItem(STORAGE_KEY, value);
		});
	}
	
	return store;
}

export const pageMode = createPageModeStore();