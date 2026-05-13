import type { SavedRecipe } from '$lib/stores/recipes';

export interface ParsedIngredient {
	quantity: number | null;
	unit: string | null;
	name: string;
	original: string;
}

export interface ConsolidatedIngredient {
	name: string;
	quantity: number;
	unit: string;
	displayText: string;
	recipes: string[];
	recipeIds: string[];
	available: boolean;
}

const PANTRY_STAPLES = [
	'salt', 'sea salt', 'kosher salt', 'table salt',
	'pepper', 'black pepper', 'ground pepper',
	'oil', 'olive oil', 'vegetable oil', 'cooking oil', 'canola oil',
	'water', 'hot water', 'cold water', 'warm water',
	'butter', 'unsalted butter', 'salted butter',
	'sugar', 'granulated sugar', 'white sugar',
	'flour', 'all-purpose flour', 'all purpose flour'
];

const UNIT_PATTERNS: { [key: string]: RegExp } = {
	cups: /\bcups?\b/i,
	tbsp: /\b(?:tbsp|tablespoon(?:s)?)\b/i,
	tsp: /\b(?:tsp|teaspoon(?:s)?)\b/i,
	lb: /\b(?:lb|lbs|pound(?:s)?)\b/i,
	oz: /\b(?:oz|ounce(?:s)?)\b/i,
	g: /\b(?:g|gram(?:s)?)\b/i,
	kg: /\b(?:kg|kilogram(?:s)?)\b/i,
	ml: /\b(?:ml|milliliter(?:s)?)\b/i,
	l: /\b(?:l|liter(?:s)?)\b/i,
	piece: /\b(?:piece(?:s)?|clove(?:s)?)\b/i,
	clove: /\b(?:clove(?:s)?)\b/i,
	cans: /\b(?:can(?:s)?)\b/i,
	bottle: /\b(?:bottle(?:s)?)\b/i,
	bunch: /\b(?:bunch(?:es)?)\b/i,
};

const UNIT_CONVERSIONS: { [key: string]: { base: string; ratio: number } } = {
	tsp: { base: 'tsp', ratio: 1 },
	tbsp: { base: 'tsp', ratio: 3 },
	cup: { base: 'tsp', ratio: 48 },
	cups: { base: 'tsp', ratio: 48 },
	oz: { base: 'oz', ratio: 1 },
	lb: { base: 'oz', ratio: 16 },
	lbs: { base: 'oz', ratio: 16 },
	g: { base: 'g', ratio: 1 },
	kg: { base: 'g', ratio: 1000 },
	ml: { base: 'ml', ratio: 1 },
	l: { base: 'ml', ratio: 1000 },
	piece: { base: 'piece', ratio: 1 },
	pieces: { base: 'piece', ratio: 1 },
	clove: { base: 'clove', ratio: 1 },
	cloves: { base: 'clove', ratio: 1 },
};

function parseFraction(str: string): number {
	if (str.includes('/')) {
		const [num, denom] = str.split('/');
		return parseInt(num) / parseInt(denom);
	}
	return parseFloat(str);
}

function extractQuantity(str: string): { quantity: number | null; remainder: string } {
	const fractionPattern = /^(\d+)\s*\/\s*(\d+)/;
	const mixedPattern = /^(\d+)\s+(\d+)\s*\/\s*(\d+)/;
	const decimalPattern = /^(\d+(?:\.\d+)?)/;
	
	let match: RegExpMatchArray | null;
	
	match = str.match(new RegExp(`^${mixedPattern.source}`));
	if (match) {
		const whole = parseInt(match[1]);
		const num = parseInt(match[2]);
		const denom = parseInt(match[3]);
		const remainder = str.slice(match[0].length).trim();
		return { quantity: whole + num / denom, remainder };
	}
	
	match = str.match(new RegExp(`^${fractionPattern.source}`));
	if (match) {
		const num = parseInt(match[1]);
		const denom = parseInt(match[2]);
		const remainder = str.slice(match[0].length).trim();
		return { quantity: num / denom, remainder };
	}
	
	match = str.match(new RegExp(`^${decimalPattern.source}`));
	if (match) {
		const val = parseFloat(match[1]);
		const remainder = str.slice(match[0].length).trim();
		return { quantity: val, remainder };
	}
	
	return { quantity: null, remainder: str };
}

function extractUnit(str: string): { unit: string | null; remainder: string } {
	for (const [unit, pattern] of Object.entries(UNIT_PATTERNS)) {
		const match = str.match(pattern);
		if (match) {
			const remainder = str.replace(match[0], '').trim();
			return { unit, remainder };
		}
	}
	return { unit: null, remainder: str };
}

export function parseIngredient(line: string): ParsedIngredient {
	const original = line.trim();
	
	let working = original;
	
	let quantity: number | null = null;
	let unit: string | null = null;
	
	const qtyResult = extractQuantity(working);
	if (qtyResult.quantity !== null) {
		quantity = qtyResult.quantity;
		working = qtyResult.remainder;
	}
	
	const unitResult = extractUnit(working);
	if (unitResult.unit) {
		unit = unitResult.unit;
		working = unitResult.remainder;
	}
	
	const name = working.trim() || original;
	
	return { quantity, unit, name, original };
}

function normalizeUnit(unit: string | null): { base: string; ratio: number } | null {
	if (!unit) return null;
	
	const lowerUnit = unit.toLowerCase();
	if (UNIT_CONVERSIONS[lowerUnit]) {
		return UNIT_CONVERSIONS[lowerUnit];
	}
	return null;
}

function formatQuantity(quantity: number, unit: string | null): string {
	if (!unit) {
		return quantity % 1 === 0 ? `${quantity}` : `${quantity.toFixed(1).replace(/\.0$/, '')}`;
	}
	
	const conv = normalizeUnit(unit);
	if (!conv) {
		return `${formatQuantity(quantity, null)} ${unit}`;
	}
	
	if (conv.base === 'tsp') {
		const qty = quantity * conv.ratio;
		if (qty >= 48) {
			return `${(qty / 48).toFixed(1).replace(/\.0$/, '')} cups`;
		} else if (qty >= 3) {
			return `${(qty / 3).toFixed(1).replace(/\.0$/, '')} tbsp`;
		} else {
			return `${qty.toFixed(1).replace(/\.0$/, '')} tsp`;
		}
	}
	
	if (conv.base === 'oz') {
		const qty = quantity * conv.ratio;
		if (qty >= 16) {
			return `${(qty / 16).toFixed(1).replace(/\.0$/, '')} lbs`;
		} else {
			return `${qty.toFixed(1).replace(/\.0$/, '')} oz`;
		}
	}
	
	if (conv.base === 'g') {
		const qty = quantity * conv.ratio;
		if (qty >= 1000) {
			return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')} kg`;
		} else {
			return `${qty.toFixed(0)} g`;
		}
	}
	
	if (conv.base === 'ml') {
		const qty = quantity * conv.ratio;
		if (qty >= 1000) {
			return `${(qty / 1000).toFixed(1).replace(/\.0$/, '')} L`;
		} else {
			return `${qty.toFixed(0)} ml`;
		}
	}
	
	return `${formatQuantity(quantity, null)} ${unit}`;
}

function normalizeName(name: string): string {
	return name
		.toLowerCase()
		.replace(/^(fresh|dried|ground|minced|chopped|sliced|diced|grated)\s+/i, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function isPantryStaple(name: string): boolean {
	const normalized = normalizeName(name);
	return PANTRY_STAPLES.some(staple => 
		normalized === staple || 
		normalized.includes(staple) || 
		staple.includes(normalized)
	);
}

function canMerge(name1: string, name2: string): boolean {
	const n1 = normalizeName(name1);
	const n2 = normalizeName(name2);
	return n1 === n2 || n1.includes(n2) || n2.includes(n1);
}

export function consolidateIngredients(recipes: SavedRecipe[]): ConsolidatedIngredient[] {
	const ingredientMap = new Map<string, ConsolidatedIngredient>();
	
	for (const recipe of recipes) {
		const ingredients = recipe.ingredients || [];
		
		for (const line of ingredients) {
			const parsed = parseIngredient(line);
			const normalizedName = normalizeName(parsed.name);
			
			let found = false;
			
			for (const [key, existing] of ingredientMap) {
				if (canMerge(key, normalizedName)) {
					if (parsed.quantity !== null && parsed.unit && existing.unit) {
						const existingConv = normalizeUnit(existing.unit);
						const parsedConv = normalizeUnit(parsed.unit);
						
						if (existingConv && parsedConv && existingConv.base === parsedConv.base) {
							existing.quantity += parsed.quantity * parsedConv.ratio / existingConv.ratio;
							existing.recipes.push(recipe.name);
							existing.recipeIds.push(recipe.id);
							found = true;
							break;
						}
					}
					
					if (parsed.quantity === null && existing.quantity === null) {
						existing.recipes.push(recipe.name);
						existing.recipeIds.push(recipe.id);
						found = true;
						break;
					}
				}
			}
			
			if (!found) {
				const key = normalizedName;
				ingredientMap.set(key, {
					name: parsed.name,
					quantity: parsed.quantity || 0,
					unit: parsed.unit || '',
					displayText: formatQuantity(parsed.quantity || 0, parsed.unit),
					recipes: [recipe.name],
					recipeIds: [recipe.id],
					available: isPantryStaple(parsed.name)
				});
			}
		}
	}
	
	const ingredients = Array.from(ingredientMap.values());
	
	for (const ing of ingredients) {
		ing.displayText = formatQuantity(ing.quantity, ing.unit);
		ing.displayText = ing.displayText ? `${ing.displayText} ${ing.name}` : ing.name;
	}
	
	ingredients.sort((a, b) => {
		if (a.available !== b.available) {
			return a.available ? 1 : -1;
		}
		return a.name.localeCompare(b.name);
	});
	
	return ingredients;
}