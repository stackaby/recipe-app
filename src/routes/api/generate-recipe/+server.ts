import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateFullRecipe } from '$lib/services/venice';
import type { RecipeMode } from '$lib/stores/ingredients';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { recipeName, ingredients, mode } = await request.json() as { 
			recipeName: string; 
			ingredients: string[];
			mode?: RecipeMode;
		};
		
		if (!recipeName || !ingredients || !Array.isArray(ingredients)) {
			return json({ error: 'Recipe name and ingredients are required' }, { status: 400 });
		}
		
		const recipeMode: RecipeMode = mode || 'open';
		const recipe = await generateFullRecipe(recipeName, ingredients, recipeMode);
		return json({ recipe });
	} catch (error) {
		console.error('Error generating full recipe:', error);
		const message = error instanceof Error ? error.message : 'Failed to generate recipe';
		return json({ error: message }, { status: 500 });
	}
};