import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DayPlan {
	recipeId: string;
	addedAt: string;
}

export interface MealPlanState {
	days: {
		monday: DayPlan[];
		tuesday: DayPlan[];
		wednesday: DayPlan[];
		thursday: DayPlan[];
		friday: DayPlan[];
		saturday: DayPlan[];
		sunday: DayPlan[];
	};
}

const STORAGE_KEY = 'mealPlan';
const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function getInitialState(): MealPlanState {
	const empty: MealPlanState = {
		days: {
			monday: [],
			tuesday: [],
			wednesday: [],
			thursday: [],
			friday: [],
			saturday: [],
			sunday: []
		}
	};
	
	if (!browser) return empty;
	
	const stored = localStorage.getItem(STORAGE_KEY);
	if (!stored) return empty;
	
	try {
		return JSON.parse(stored);
	} catch {
		return empty;
	}
}

function createMealPlanStore() {
	const store = writable<MealPlanState>(getInitialState());
	
	if (browser) {
		store.subscribe(value => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
		});
	}
	
	return {
		subscribe: store.subscribe,
		
		addRecipe(day: DayOfWeek, recipeId: string) {
			store.update(state => ({
				...state,
				days: {
					...state.days,
					[day]: [
						...state.days[day],
						{ recipeId, addedAt: new Date().toISOString() }
					]
				}
			}));
		},
		
		removeRecipe(day: DayOfWeek, recipeId: string) {
			store.update(state => ({
				...state,
				days: {
					...state.days,
					[day]: state.days[day].filter(p => p.recipeId !== recipeId)
				}
			}));
		},
		
		moveRecipe(fromDay: DayOfWeek, toDay: DayOfWeek, recipeId: string) {
			store.update(state => {
				const plan = state.days[fromDay].find(p => p.recipeId === recipeId);
				if (!plan) return state;
				
				return {
					...state,
					days: {
						...state.days,
						[fromDay]: state.days[fromDay].filter(p => p.recipeId !== recipeId),
						[toDay]: [...state.days[toDay], plan]
					}
				};
			});
		},
		
		clearDay(day: DayOfWeek) {
			store.update(state => ({
				...state,
				days: {
					...state.days,
					[day]: []
				}
			}));
		},
		
		clearWeek() {
			store.update(state => ({
				...state,
				days: {
					monday: [],
					tuesday: [],
					wednesday: [],
					thursday: [],
					friday: [],
					saturday: [],
					sunday: []
				}
			}));
		},
		
		getRecipeIds(): string[] {
			let ids: string[] = [];
			store.subscribe(state => {
				ids = DAYS.flatMap(day => state.days[day].map(p => p.recipeId));
			})();
			return ids;
		}
	};
}

export const mealPlan = createMealPlanStore();
export { DAYS };

export const mealPlanModalVisible = writable(false);