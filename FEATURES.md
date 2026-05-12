# Feature Roadmap

Cooking assistant features for future development.

---

## High Priority

### Timer
Multi-timer support for cooking steps.

- Start timer from recipe step (e.g., "Boil for 10min")
- Audio/visual alert when complete
- Multiple concurrent timers
- Pause/resume/cancel controls
- Timer persists if navigating away

**UX options:**
- Inline timers in recipe modal → "Start timer" button per step
- Global timer drawer → Manage all active timers
- Recommended: Both approaches

---

### Step-by-Step Mode
Walk through recipe one instruction at a time.

- Large, focused view of current step
- "Next" / "Previous" navigation
- Mark step as complete
- Progress indicator (Step 3 of 7)
- Auto-advance timer integration

---

## Medium Priority

### Scale Servings
Adjust ingredient quantities dynamically.

- Input desired servings
- Recalculate all ingredient amounts
- Support 0.5x, 1.5x, 2x, 3x multipliers
- Preserve original recipe as reference

---

### Shopping Checklist
Enhanced shopping list experience.

- Check off items as purchased
- Group items by store section (produce, dairy, meat, pantry)
- Manual add custom items
- Clear all checked items
- Share/export list

---

### Meal Planner
Schedule recipes for the week.

- Calendar view (Mon-Sun)
- Assign recipes to meal slots
- Auto-generate consolidated shopping list for planned meals
- Drag-and-drop reorganization
- Import from favorites/recent

---

### Ingredient Substitutions
Suggest alternatives for missing ingredients.

- Database of common substitutions
- Context-aware suggestions based on recipe type
- User can toggle substitution to update ingredient list
- Example: "Don't have buttermilk? Use 1 cup milk + 1 tbsp vinegar"

---

## Lower Priority

### Voice Mode
Hands-free cooking experience.

- Voice commands: "Next step", "Start timer", "Repeat", "Go back"
- Read steps aloud via text-to-speech
- Useful when hands are dirty/cooking

---

### Nutrition Estimates
Calorie and macro information.

- Estimate per serving: calories, protein, carbs, fat
- Display in recipe modal
- Aggregate totals for meal plans
- API integration or local calculation

---

## Status Legend

- Not started
- In progress
- Complete