import { writable, get } from 'svelte/store';
import { savedRecipes } from './recipes';
import type { SavedRecipe } from './recipes';

export const modalRecipe = writable<SavedRecipe | null>(null);
export const modalLoading = writable(false);

export function openRecipeModal(recipe: SavedRecipe) {
	modalRecipe.set(recipe);
	modalLoading.set(false);
}

export function closeRecipeModal() {
	modalRecipe.set(null);
	modalLoading.set(false);
}

export function setModalLoading(loading: boolean) {
	modalLoading.set(loading);
}

export function syncModalRecipe() {
	const current = get(modalRecipe);
	if (current) {
		const updated = get(savedRecipes).find(r => r.id === current.id);
		if (updated) {
			modalRecipe.set(updated);
		}
	}
}