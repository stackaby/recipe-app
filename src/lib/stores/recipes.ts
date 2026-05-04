import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface SavedRecipe {
	id: string;
	name: string;
	description: string;
	ingredients: string[];
	availableIngredients: string[];
	neededIngredients: string[];
	instructions: string[];
	prepTime: string;
	cookTime: string;
	servings: number;
	sourceIngredients: string[];
	mode: 'open' | 'restrictive';
	source: 'ai' | 'found';
	sourceName?: string;
	sourceUrl?: string;
	imageUrl?: string;
	createdAt: string;
}

const STORAGE_KEY = 'savedRecipes';
const MAX_RECIPES = 10;

function generateId(): string {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function createRecipeStore() {
	const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
	const initial: SavedRecipe[] = stored ? JSON.parse(stored) : [];
	
	const store = writable<SavedRecipe[]>(initial);
	
	if (browser) {
		store.subscribe(value => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		});
	}
	
	return {
		subscribe: store.subscribe,
		
		saveRecipe(recipe: Omit<SavedRecipe, 'id' | 'createdAt'>): SavedRecipe {
			const newRecipe: SavedRecipe = {
				...recipe,
				id: generateId(),
				createdAt: new Date().toISOString()
			};
			
			store.update(recipes => {
				const updated = [newRecipe, ...recipes];
				return updated.slice(0, MAX_RECIPES);
			});
			
			return newRecipe;
		},
		
		deleteRecipe(id: string) {
			store.update(recipes => recipes.filter(r => r.id !== id));
		},
		
		updateRecipe(id: string, updates: Partial<SavedRecipe>) {
			store.update(recipes => 
				recipes.map(r => r.id === id ? { ...r, ...updates } : r)
			);
		},
		
		getById(id: string): SavedRecipe | undefined {
			let result: SavedRecipe | undefined;
			store.subscribe(recipes => {
				result = recipes.find(r => r.id === id);
			})();
			return result;
		},
		
		clearAll() {
			store.set([]);
		}
	};
}

export const savedRecipes = createRecipeStore();