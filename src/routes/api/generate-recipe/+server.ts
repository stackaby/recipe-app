import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateFullRecipe } from '$lib/services/venice';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { recipeName, ingredients } = await request.json();
		
		if (!recipeName || !ingredients || !Array.isArray(ingredients)) {
			return json({ error: 'Recipe name and ingredients are required' }, { status: 400 });
		}
		
		const recipe = await generateFullRecipe(recipeName, ingredients);
		return json({ recipe });
	} catch (error) {
		console.error('Error generating full recipe:', error);
		const message = error instanceof Error ? error.message : 'Failed to generate recipe';
		return json({ error: message }, { status: 500 });
	}
};