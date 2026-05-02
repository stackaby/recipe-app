const VENICE_API_KEY = process.env.VENICE_API_KEY;
import type { RecipeMode } from '$lib/stores/ingredients';

const VENICE_BASE_URL = 'https://api.venice.ai/api/v1';

export interface RecipeOption {
	name: string;
	description: string;
}

export interface FullRecipe {
	name: string;
	description: string;
	ingredients: string[];
	availableIngredients: string[];
	neededIngredients: string[];
	instructions: string[];
	prepTime: string;
	cookTime: string;
	servings: number;
	mode: RecipeMode;
}

export async function generateRecipeNames(ingredients: string[], mode: RecipeMode): Promise<RecipeOption[]> {
	const modeInstruction = mode === 'restrictive'
		? 'The recipes should ONLY use the provided ingredients plus common pantry staples (salt, pepper, cooking oil, butter, water). Do not suggest additional ingredients.'
		: 'The recipes can use the provided ingredients as a base and may suggest additional ingredients the cook might need to purchase.';
	
	const prompt = `Given these ingredients: ${ingredients.join(', ')}

${modeInstruction}

Generate 5 creative recipe ideas. For each recipe, provide:
1. A catchy recipe name
2. A brief one-sentence description

Format your response as JSON array:
[{"name": "Recipe Name", "description": "Brief description"}]

Only return the JSON array, no other text.`;

	const response = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${VENICE_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'llama-3.3-70b',
			messages: [
				{
					role: 'system',
					content: 'You are a creative chef assistant. Generate delicious, practical recipe ideas based on available ingredients. Always respond with valid JSON.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.8
		})
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Venice API error: ${response.status} - ${error}`);
	}

	const data = await response.json();
	const content = data.choices[0]?.message?.content;
	
	if (!content) {
		throw new Error('No response from Venice API');
	}

	try {
		const recipes = JSON.parse(content);
		return recipes.slice(0, 5);
	} catch {
		throw new Error('Failed to parse recipe response');
	}
}

export async function generateFullRecipe(
	recipeName: string,
	availableIngredients: string[],
	mode: RecipeMode
): Promise<FullRecipe> {
	const pantryStaples = 'salt, pepper, cooking oil, olive oil, butter, water';
	
	const modeInstruction = mode === 'restrictive'
		? `IMPORTANT: Use ONLY these ingredients: ${availableIngredients.join(', ')}.
You may also use common pantry staples (${pantryStaples}) as needed.
Do NOT include any other ingredients. The "neededIngredients" array must be EMPTY.`
		: `Use these ingredients as a base: ${availableIngredients.join(', ')}.
You may suggest additional ingredients the cook will need to purchase.
Separate ingredients into "availableIngredients" (what they have) and "neededIngredients" (what to buy).
Common pantry staples (${pantryStaples}) can be included if needed.`;

	const prompt = `Create a complete recipe for "${recipeName}".

${modeInstruction}

Provide a complete recipe with:
1. A brief description (1-2 sentences)
2. Ingredients separated into what they have vs need to buy
3. Complete ingredients list with quantities (for display purposes)
4. Step-by-step instructions
5. Prep time (in minutes)
6. Cook time (in minutes)
7. Number of servings

Format your response as JSON:
{
  "name": "Recipe Name",
  "description": "Brief description",
  "availableIngredients": ["2 chicken breasts", "4 cloves garlic", ...],
  "neededIngredients": ["1 cup heavy cream", "fresh herbs", ...],
  "ingredients": ["2 chicken breasts", "4 cloves garlic", "1 cup heavy cream", "fresh herbs", ...],
  "instructions": ["Step 1...", "Step 2...", ...],
  "prepTime": "15",
  "cookTime": "30",
  "servings": 4
}

Only return the JSON object, no other text.`;

	const response = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${VENICE_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'llama-3.3-70b',
			messages: [
				{
					role: 'system',
					content: `You are a professional chef. Create detailed, easy-to-follow recipes with accurate measurements and clear instructions. Always respond with valid JSON.

${mode === 'restrictive' 
	? 'You must strictly limit ingredients to what is available plus basic pantry staples.' 
	: 'You can creatively suggest additional ingredients that would enhance the recipe.'}`
				},
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.7
		})
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Venice API error: ${response.status} - ${error}`);
	}

	const data = await response.json();
	const content = data.choices[0]?.message?.content;
	
	if (!content) {
		throw new Error('No response from Venice API');
	}

	try {
		const recipe = JSON.parse(content);
		return {
			name: recipe.name || recipeName,
			description: recipe.description || '',
			ingredients: recipe.ingredients || [],
			availableIngredients: recipe.availableIngredients || recipe.ingredients || [],
			neededIngredients: recipe.neededIngredients || [],
			instructions: recipe.instructions || [],
			prepTime: recipe.prepTime || '10',
			cookTime: recipe.cookTime || '20',
			servings: recipe.servings || 4,
			mode
		};
	} catch {
		throw new Error('Failed to parse full recipe response');
	}
}

async function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateRecipeImage(recipeName: string, maxRetries = 3): Promise<string> {
	const prompt = `Professional food photography of ${recipeName}, realistic, appetizing, plated beautifully, soft natural lighting, shallow depth of field, high quality restaurant style presentation, clean white or wooden background`;
	
	let lastError: Error | null = null;
	
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			const response = await fetch(`${VENICE_BASE_URL}/image/generate`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${VENICE_API_KEY}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'flux-2-max',
					prompt: prompt,
					width: 512,
					height: 512,
					format: 'webp'
				})
			});
			
			if (!response.ok) {
				const error = await response.text();
				
				if (response.status === 503 && attempt < maxRetries) {
					throw new Error(`Model overloaded, retrying... (attempt ${attempt}/${maxRetries})`);
				}
				
				throw new Error(`Venice Image API error: ${response.status} - ${error}`);
			}
			
			const data = await response.json();
			const base64Image = data.images?.[0];
			
			if (!base64Image) {
				throw new Error('No image data in response');
			}
			
			return `data:image/webp;base64,${base64Image}`;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error('Unknown error');
			
			if (attempt < maxRetries) {
				const delay = attempt * 2000;
				await sleep(delay);
			}
		}
	}
	
	throw lastError || new Error('Failed to generate image after retries');
}