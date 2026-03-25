import { UserData, Scores, ProfileType } from './types';
export type { ProfileType };

export function calculateBMR(weight: number, heightInches: number, age: number): number {
  return 655 + (4.35 * weight) + (4.7 * heightInches) - (4.7 * age);
}

export function getActivityMultiplier(steps: string, work: string, exercise?: string): number {
  if (steps === '10000+' || (work === 'On your feet' && exercise)) return 1.55;
  if (steps === '8000-10000') return 1.5;
  if (steps === '5000-8000' || work === 'On your feet') return 1.4;
  if (steps === '3000-5000' || work === 'Hybrid') return 1.3;
  return 1.2;
}

export function calculateMaintenance(data: UserData): number {
  const heightInches = data.heightFt * 12 + data.heightIn;
  const bmr = calculateBMR(data.weight, heightInches, data.age);
  const multiplier = getActivityMultiplier(data.dailySteps, data.workType);
  return Math.round(bmr * multiplier);
}

export function calculateBodyFat(weight: number, heightFt: number, heightIn: number, age: number): number {
  const heightInches = heightFt * 12 + heightIn;
  const bmi = (weight / (heightInches * heightInches)) * 703;
  const bodyFat = (1.2 * bmi) + (0.23 * age) - 5.4;
  return Math.round(bodyFat);
}

export function calculateScores(data: UserData): Scores {
  // MORNING PROTEIN
  let morningProtein = 1;
  switch (data.breakfast) {
    case 'Eggs or protein': morningProtein = 9; break;
    case 'Smoothie': morningProtein = 6; break;
    case 'Cereal or toast': morningProtein = 3; break;
    case 'Coffee and pastry': morningProtein = 2; break;
    case 'Fast food': morningProtein = 2; break;
    case 'Skip it': morningProtein = 1; break;
  }

  // BLOOD SUGAR
  let bloodSugar = 10;
  if (['Skip it', 'Coffee and pastry', 'Cereal or toast'].includes(data.breakfast)) bloodSugar -= 2;
  if (['4-7', 'Daily'].includes(data.sugaryDrinks)) bloodSugar -= 2;
  if (data.snackTime === 'Afternoon') bloodSugar -= 2;
  if (data.energyAfternoon <= 4) bloodSugar -= 2;
  if (data.snackTime === 'Late night') bloodSugar -= 1;
  bloodSugar = Math.max(1, bloodSugar);

  // HYDRATION (using sugary drinks as proxy since we don't ask water directly)
  let hydration = 6; // default mid-range
  if (data.sugaryDrinks === 'None') hydration = 8;
  else if (data.sugaryDrinks === '1-3') hydration = 6;
  else if (data.sugaryDrinks === '4-7') hydration = 4;
  else if (data.sugaryDrinks === 'Daily') hydration = 2;
  hydration = Math.max(1, hydration);

  // MOVEMENT
  let movement = 1;
  switch (data.dailySteps) {
    case '10000+': movement = 9; break;
    case '8000-10000': movement = 7; break;
    case '5000-8000': movement = 5; break;
    case '3000-5000': movement = 3; break;
    case 'Under 3000': movement = 1; break;
  }
  movement = Math.min(10, movement);

  // ELIMINATIONS
  let eliminations = 10;
  if (data.sugaryDrinks === 'Daily') eliminations -= 2;
  if (data.sugaryDrinks === '4-7') eliminations -= 1;
  if (['5+', 'Almost every meal'].includes(data.eatingOut)) eliminations -= 2;
  if (data.eatingOut === '3-4') eliminations -= 1;
  if (['Afternoon', 'After dinner', 'Late night'].includes(data.snackTime)) eliminations -= 2;
  if (data.breakfast === 'Fast food') eliminations -= 1;
  eliminations = Math.max(1, eliminations);

  // ACCOUNTABILITY
  let accountability = 2;
  switch (data.coachBefore) {
    case 'Yes and it helped': accountability = 6; break;
    case 'Have one now': accountability = 7; break;
    case 'Yes but didn\'t work': accountability = 3; break;
    case 'Never': accountability = 2; break;
  }
  if (data.nutritionCheck === 'Nobody') accountability -= 2;
  if (data.nutritionCheck === 'Doctor only') accountability -= 1;
  if (data.readiness >= 8) accountability += 2;
  else if (data.readiness < 5) accountability -= 1;
  accountability = Math.max(1, Math.min(10, accountability));

  const total = morningProtein + bloodSugar + hydration + movement + eliminations + accountability;

  return { morningProtein, bloodSugar, hydration, movement, eliminations, accountability, total };
}

export function assignProfile(data: UserData): ProfileType {
  const scores: Record<ProfileType, number> = {
    'skipper': 0,
    'sugar-crasher': 0,
    'busy-mom': 0,
    'restaurant-regular': 0,
    'repeat-starter': 0,
  };

  // SKIPPER (max 5 points)
  if (data.breakfast === 'Skip it') scores['skipper']++;
  if (['After dinner', 'Late night'].includes(data.snackTime)) scores['skipper']++;
  if (data.sugaryDrinks === 'None' || data.sugaryDrinks === '1-3') scores['skipper']++; // skippers don't drink much — they don't eat much period
  if (data.dailySteps === 'Under 3000') scores['skipper']++;
  if (data.energyAfternoon > 0 && data.energyAfternoon <= 4) scores['skipper']++;

  // SUGAR CRASHER (max 5 points)
  if (['Coffee and pastry', 'Cereal or toast', 'Smoothie'].includes(data.breakfast)) scores['sugar-crasher']++;
  if (data.snackTime === 'Afternoon') scores['sugar-crasher']++;
  if (['4-7', 'Daily'].includes(data.sugaryDrinks)) scores['sugar-crasher']++;
  if (data.energyAfternoon > 0 && data.energyAfternoon <= 4) scores['sugar-crasher']++;
  if (data.energyMorning > 0 && data.energyMorning >= 7) scores['sugar-crasher']++;

  // BUSY MOM (max 5 points)
  if (['1-2 kids', '3+ kids'].includes(data.kids)) scores['busy-mom']++;
  if (data.stressLevel >= 7) scores['busy-mom']++;
  if (data.sleepQuality > 0 && data.sleepQuality <= 5) scores['busy-mom']++;
  if (['Skip it', 'Coffee and pastry'].includes(data.breakfast)) scores['busy-mom']++;
  if (['Cook at home', "Whatever's easy"].includes(data.whyNow) === false && data.kids !== 'No kids' && data.kids !== '') scores['busy-mom']++; // extra point for moms

  // RESTAURANT REGULAR (max 5 points)
  if (['5+', 'Almost every meal'].includes(data.eatingOut)) { scores['restaurant-regular'] += 2; } // heavy weight — this is the key signal
  else if (['3-4'].includes(data.eatingOut)) scores['restaurant-regular']++;
  if (data.breakfast === 'Fast food') scores['restaurant-regular']++;
  if (data.restaurants.length >= 3) scores['restaurant-regular']++; // picked max restaurants
  if (data.sugaryDrinks === '4-7' || data.sugaryDrinks === 'Daily') scores['restaurant-regular']++;

  // REPEAT STARTER (max 5 points)
  if (['5-10 years', '10+ years'].includes(data.howLong)) scores['repeat-starter']++;
  if (data.triedBefore.length >= 3) scores['repeat-starter']++;
  if (['Too restrictive', "Couldn't maintain"].includes(data.whyStopped)) scores['repeat-starter']++;
  if (data.readiness > 0 && data.readiness <= 5) scores['repeat-starter']++;
  if (data.coachBefore === "Yes but didn't work") scores['repeat-starter']++;

  // Find highest. Priority order for ties: Repeat Starter > Busy Mom > Sugar Crasher > Skipper > Restaurant Regular
  const priority: ProfileType[] = ['repeat-starter', 'busy-mom', 'sugar-crasher', 'skipper', 'restaurant-regular'];
  let maxScore = -1;
  let winner: ProfileType = 'repeat-starter'; // default to highest priority

  for (const p of priority) {
    if (scores[p] >= maxScore) {
      // First time or higher score — take it. Equal score keeps priority order (first in list wins).
      if (scores[p] > maxScore) {
        maxScore = scores[p];
        winner = p;
      }
    }
  }

  return winner;
}

export const profileNames: Record<ProfileType, string> = {
  'skipper': 'THE SKIPPER',
  'sugar-crasher': 'THE SUGAR CRASHER',
  'busy-mom': 'THE BUSY MOM',
  'restaurant-regular': 'THE RESTAURANT REGULAR',
  'repeat-starter': 'THE REPEAT STARTER',
};

export const profileDescriptions: Record<ProfileType, string> = {
  'skipper': "You skip meals and run on empty until you crash. Then you eat everything in sight because your body is starving. This isn't a discipline problem. Your body is doing exactly what it's supposed to do when it doesn't get fed.",
  'sugar-crasher': "Your mornings start fine but by afternoon you're in a fog. That crash sends you looking for sugar and snacks to get through the day. The weight isn't from eating too much. It's from eating the wrong thing at the wrong time.",
  'busy-mom': "Everyone eats before you do. You take care of the whole house and put yourself last. By dinner you're so hungry you eat fast, eat big, and eat whatever's closest. You don't need a diet. You need someone to make sure YOU get fed.",
  'restaurant-regular': "You eat out because life moves fast and cooking isn't realistic. The problem isn't the restaurants. It's not knowing what to order when you get there. A few swaps at the places you already eat changes everything.",
  'repeat-starter': "You've tried everything. Keto. Weight Watchers. Gym programs. Calorie counting. You've lost weight before. It always comes back because nobody helped you keep it. This time is different because we're only changing one thing at a time.",
};
