import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateRecipeNames } from '$lib/services/venice';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { ingredients } = await request.json();
		
		if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
			return json({ error: 'Please provide at least one ingredient' }, { status: 400 });
		}
		
		const recipes = await generateRecipeNames(ingredients);
		return json({ recipes });
	} catch (error) {
		console.error('Error generating recipes:', error);
		const message = error instanceof Error ? error.message : 'Failed to generate recipes';
		return json({ error: message }, { status: 500 });
	}
};