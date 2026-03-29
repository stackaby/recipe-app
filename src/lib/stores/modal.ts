import { writable } from 'svelte/store';
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