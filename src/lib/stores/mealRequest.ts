import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type MealCategory = 
	| 'quick'
	| 'dinner'
	| 'lunch'
	| 'breakfast'
	| 'vegetarian'
	| 'vegan'
	| 'healthy'
	| 'comfort'
	| 'kid-friendly'
	| 'date-night';

export const MEAL_CATEGORIES: { id: MealCategory; label: string }[] = [
	{ id: 'quick', label: 'Quick (30 min)' },
	{ id: 'dinner', label: 'Dinner' },
	{ id: 'lunch', label: 'Lunch' },
	{ id: 'breakfast', label: 'Breakfast' },
	{ id: 'vegetarian', label: 'Vegetarian' },
	{ id: 'vegan', label: 'Vegan' },
	{ id: 'healthy', label: 'Healthy' },
	{ id: 'comfort', label: 'Comfort Food' },
	{ id: 'kid-friendly', label: 'Kid-Friendly' },
	{ id: 'date-night', label: 'Date Night' }
];

const STORAGE_KEY = 'mealRequest';

interface MealRequestState {
	text: string;
	categories: MealCategory[];
}

function createMealRequestStore() {
	const stored = browser ? localStorage.getItem(STORAGE_KEY) : null;
	const initial: MealRequestState = stored 
		? JSON.parse(stored) 
		: { text: '', categories: [] };
	
	const store = writable<MealRequestState>(initial);
	
	if (browser) {
		store.subscribe(value => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		});
	}
	
	return {
		subscribe: store.subscribe,
		
		setText: (value: string) => store.update(s => ({ ...s, text: value })),
		
		toggleCategory: (category: MealCategory) => store.update(s => ({
			...s,
			categories: s.categories.includes(category)
				? s.categories.filter(c => c !== category)
				: [...s.categories, category]
		})),
		
		clearCategories: () => store.update(s => ({ ...s, categories: [] })),
		
		clear: () => store.set({ text: '', categories: [] })
	};
}

export const mealRequest = createMealRequestStore();

export const mealRequestText = derived(mealRequest, $mealRequest => $mealRequest.text);
export const mealRequestCategories = derived(mealRequest, $mealRequest => $mealRequest.categories);