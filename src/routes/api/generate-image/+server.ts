import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateRecipeImage } from '$lib/services/venice';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { recipeName } = await request.json();
		
		if (!recipeName) {
			return json({ error: 'Recipe name is required' }, { status: 400 });
		}
		
		const imageUrl = await generateRecipeImage(recipeName);
		return json({ imageUrl });
	} catch (error) {
		console.error('Error generating image:', error);
		const message = error instanceof Error ? error.message : 'Failed to generate image';
		return json({ error: message }, { status: 500 });
	}
};