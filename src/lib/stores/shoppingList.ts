import { derived, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { mealPlan, DAYS } from './mealPlan';
import { savedRecipes } from './recipes';
import { consolidateIngredients } from '$lib/utils/ingredients';

export interface ShoppingItem {
	name: string;
	quantity: number;
	unit: string;
	displayText: string;
	recipes: string[];
	recipeIds: string[];
	available: boolean;
}

export const shoppingList = derived(
	[mealPlan, savedRecipes],
	([$mealPlan, $savedRecipes]): ShoppingItem[] => {
		const recipeIds = DAYS.flatMap(day => $mealPlan.days[day].map(p => p.recipeId));
		const recipes = recipeIds
			.map(id => $savedRecipes.find(r => r.id === id))
			.filter((r): r is NonNullable<typeof r> => r !== undefined);
		
		return consolidateIngredients(recipes);
	}
);

const SHOPPING_LIST_KEY = 'shoppingListAvailability';
const CUSTOM_ITEMS_KEY = 'customShoppingItems';

export interface CustomItem {
	id: string;
	name: string;
	quantity: number;
	checked: boolean;
}

function loadAvailability(): Record<string, boolean> {
	if (typeof window === 'undefined') return {};
	const stored = localStorage.getItem(SHOPPING_LIST_KEY);
	if (!stored) return {};
	try {
		return JSON.parse(stored);
	} catch {
		return {};
	}
}

function loadCustomItems(): CustomItem[] {
	if (!browser) return [];
	const stored = localStorage.getItem(CUSTOM_ITEMS_KEY);
	if (!stored) return [];
	try {
		return JSON.parse(stored);
	} catch {
		return [];
	}
}

export const customShoppingItems = writable<CustomItem[]>(loadCustomItems());

if (browser) {
	customShoppingItems.subscribe(items => {
		localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(items));
	});
}

export const customItemsStore = {
	addItem(name: string, quantity: number = 1) {
		customShoppingItems.update(items => [
			...items,
			{ id: crypto.randomUUID(), name, quantity, checked: false }
		]);
	},
	
	updateItem(id: string, updates: Partial<CustomItem>) {
		customShoppingItems.update(items =>
			items.map(item => item.id === id ? { ...item, ...updates } : item)
		);
	},
	
	removeItem(id: string) {
		customShoppingItems.update(items => items.filter(item => item.id !== id));
	},
	
	toggleChecked(id: string) {
		customShoppingItems.update(items =>
			items.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
		);
	},
	
	clearChecked() {
		customShoppingItems.update(items => items.filter(item => !item.checked));
	}
};

export function createShoppingListStore() {
	const availability = loadAvailability();
	
	return {
		markAvailable(ingredientName: string, available: boolean) {
			availability[ingredientName] = available;
			localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(availability));
		},
		
		getAvailability(ingredientName: string): boolean {
			return availability[ingredientName] ?? false;
		},
		
		clearAvailability() {
			localStorage.removeItem(SHOPPING_LIST_KEY);
		}
	};
}

export const shoppingListStore = createShoppingListStore();