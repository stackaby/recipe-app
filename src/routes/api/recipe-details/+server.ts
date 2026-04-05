import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRecipeDetails } from '$lib/services/spoonacular';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { recipeId } = await request.json() as { recipeId: number };
		
		if (!recipeId) {
			return json({ error: 'Recipe ID is required' }, { status: 400 });
		}
		
		const recipe = await getRecipeDetails(recipeId);
		
		return json({ recipe });
	} catch (error) {
		console.error('Error fetching recipe details:', error);
		const message = error instanceof Error ? error.message : 'Failed to fetch recipe details';
		return json({ error: message }, { status: 500 });
	}
};