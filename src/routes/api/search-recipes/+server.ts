import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchRecipesByIngredients, getRecipeDetails } from '$lib/services/spoonacular';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { ingredients } = await request.json() as { ingredients: string[] };
		
		if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
			return json({ error: 'Please provide at least one ingredient' }, { status: 400 });
		}
		
		const searchResults = await searchRecipesByIngredients(ingredients);
		const recipes = searchResults.map(r => ({
			name: r.name,
			description: `${r.usedIngredients.length} ingredients matched, ${r.missedIngredients.length} needed`,
			id: r.id,
			image: r.image,
			usedIngredients: r.usedIngredients,
			missedIngredients: r.missedIngredients
		}));
		
		return json({ recipes });
	} catch (error) {
		console.error('Error searching recipes:', error);
		const message = error instanceof Error ? error.message : 'Failed to search recipes';
		return json({ error: message }, { status: 500 });
	}
};