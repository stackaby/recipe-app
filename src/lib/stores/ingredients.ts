import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'customIngredients';
const SELECTED_KEY = 'selectedIngredients';

function createLocalStorageStore<T>(key: string, defaultValue: T) {
	const storedValue = browser ? localStorage.getItem(key) : null;
	const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue;
	
	const store = writable<T>(initialValue);
	
	if (browser) {
		store.subscribe(value => {
			localStorage.setItem(key, JSON.stringify(value));
		});
	}
	
	return store;
}

export const customIngredients = createLocalStorageStore<string[]>(STORAGE_KEY, []);
export const selectedIngredients = createLocalStorageStore<string[]>(SELECTED_KEY, []);

export function addIngredient(ingredient: string) {
	const normalized = ingredient.toLowerCase().trim();
	if (!normalized) return;
	
	selectedIngredients.update(list => {
		if (list.includes(normalized)) return list;
		return [...list, normalized];
	});
	
	customIngredients.update(list => {
		if (list.includes(normalized)) return list;
		return [...list, normalized];
	});
}

export function removeIngredient(ingredient: string) {
	const normalized = ingredient.toLowerCase().trim();
	selectedIngredients.update(list => list.filter(i => i !== normalized));
}

export function clearSelected() {
	selectedIngredients.set([]);
}