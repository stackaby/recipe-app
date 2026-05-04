import type { SavedRecipe } from '$lib/stores/recipes';

export function formatTime(minutes: string | number): string {
	const mins = typeof minutes === 'string' ? parseInt(minutes) : minutes;
	if (isNaN(mins)) return 'N/A';
	if (mins < 60) return `${mins} min`;
	const hours = Math.floor(mins / 60);
	const remainingMins = mins % 60;
	return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export function getTotalTime(recipe: SavedRecipe): string {
	const prep = parseInt(recipe.prepTime) || 0;
	const cook = parseInt(recipe.cookTime) || 0;
	return formatTime(prep + cook);
}