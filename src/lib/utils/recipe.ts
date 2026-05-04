import type { SavedRecipe } from '$lib/stores/recipes';

export function formatShoppingList(recipe: SavedRecipe): string {
	const lines: string[] = [];
	lines.push(`Shopping List: ${recipe.name}`);
	lines.push('');
	
	if (recipe.neededIngredients && recipe.neededIngredients.length > 0) {
		lines.push('What to Buy:');
		recipe.neededIngredients.forEach(ing => {
			lines.push(`• ${ing}`);
		});
		lines.push('');
	}
	
	const prep = parseInt(recipe.prepTime) || 0;
	const cook = parseInt(recipe.cookTime) || 0;
	const total = prep + cook;
	
	if (total > 0 || recipe.servings) {
		lines.push('Details:');
		if (prep > 0) lines.push(`Prep: ${prep} min`);
		if (cook > 0) lines.push(`Cook: ${cook} min`);
		lines.push(`Serves: ${recipe.servings}`);
		lines.push('');
	}
	
	if (recipe.source === 'found' && recipe.sourceUrl) {
		lines.push(`Recipe: ${recipe.sourceUrl}`);
	}
	
	return lines.join('\n');
}