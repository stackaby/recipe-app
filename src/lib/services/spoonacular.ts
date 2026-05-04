const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

export interface FoundRecipe {
	id: number;
	name: string;
	image: string;
	sourceName: string;
	sourceUrl: string;
	usedIngredients: string[];
	missedIngredients: string[];
	ingredients: string[];
	instructions: string[];
	prepTime: number;
	cookTime: number;
	servings: number;
}

interface SpoonacularSearchResult {
	id: number;
	title: string;
	image: string;
	imageType: string;
	usedIngredients: { original: string }[];
	missedIngredients: { original: string }[];
	likes: number;
}

interface SpoonacularRecipeInfo {
	id: number;
	title: string;
	image: string;
	sourceName: string;
	sourceUrl: string;
	servings: number;
	readyInMinutes: number;
	prepMinutes: number | null;
	cookingMinutes: number | null;
	extendedIngredients: { original: string }[];
	analyzedInstructions: {
		steps: { step: string }[];
	}[];
}

export async function searchRecipesByIngredients(ingredients: string[]): Promise<FoundRecipe[]> {
	const params = new URLSearchParams({
		apiKey: SPOONACULAR_API_KEY,
		ingredients: ingredients.join(','),
		number: '5',
		ranking: '1',
		ignorePantry: 'true'
	});
	
	const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/findByIngredients?${params}`);
	
	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Spoonacular search error: ${response.status} - ${error}`);
	}
	
	const results: SpoonacularSearchResult[] = await response.json();
	
	return results.map(result => ({
		id: result.id,
		name: result.title,
		image: result.image,
		sourceName: 'Spoonacular',
		sourceUrl: '',
		usedIngredients: result.usedIngredients.map(i => i.original),
		missedIngredients: result.missedIngredients.map(i => i.original),
		instructions: [],
		prepTime: 0,
		cookTime: 0,
		servings: 0
	}));
}

export async function getRecipeDetails(recipeId: number): Promise<FoundRecipe> {
	const params = new URLSearchParams({
		apiKey: SPOONACULAR_API_KEY
	});
	
	const response = await fetch(`${SPOONACULAR_BASE_URL}/recipes/${recipeId}/information?${params}`);
	
	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Spoonacular details error: ${response.status} - ${error}`);
	}
	
	const data: SpoonacularRecipeInfo = await response.json();
	
	const instructions = data.analyzedInstructions?.[0]?.steps?.map(s => s.step) || [];
	const prepTime = data.prepMinutes || Math.round(data.readyInMinutes * 0.3);
	const cookTime = data.cookingMinutes || Math.round(data.readyInMinutes * 0.7);
	const ingredients = data.extendedIngredients?.map(i => i.original) || [];
	
	return {
		id: data.id,
		name: data.title,
		image: data.image,
		sourceName: data.sourceName || 'Spoonacular',
		sourceUrl: data.sourceUrl,
		usedIngredients: [],
		missedIngredients: [],
		ingredients,
		instructions,
		prepTime,
		cookTime,
		servings: data.servings
	};
}