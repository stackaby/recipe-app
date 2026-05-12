import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateRecipesFromRequest } from '$lib/services/venice';
import type { MealCategory } from '$lib/stores/mealRequest';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { mealRequest, categories } = await request.json() as { 
			mealRequest?: string | null; 
			categories?: MealCategory[] 
		};
		
		if (!mealRequest && (!categories || categories.length === 0)) {
			return json({ error: 'Please enter a meal request or select at least one category' }, { status: 400 });
		}
		
		const recipes = await generateRecipesFromRequest(mealRequest || null, categories || []);
		return json({ recipes });
	} catch (error) {
		console.error('Error generating meal request recipes:', error);
		const message = error instanceof Error ? error.message : 'Failed to generate recipes';
		return json({ error: message }, { status: 500 });
	}
};