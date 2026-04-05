import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateRecipeNames } from '$lib/services/venice';
import type { RecipeMode } from '$lib/stores/ingredients';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { ingredients, mode } = await request.json() as { ingredients: string[]; mode?: RecipeMode };
		
		if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
			return json({ error: 'Please provide at least one ingredient' }, { status: 400 });
		}
		
		const recipeMode: RecipeMode = mode || 'open';
		const recipes = await generateRecipeNames(ingredients, recipeMode);
		return json({ recipes });
	} catch (error) {
		console.error('Error generating recipes:', error);
		const message = error instanceof Error ? error.message : 'Failed to generate recipes';
		return json({ error: message }, { status: 500 });
	}
};