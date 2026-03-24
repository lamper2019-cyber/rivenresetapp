import { UserData, Scores, ProfileType } from './types';
import { getScoreColor } from './types';

export interface StuckItem {
  title: string;
  body: string;
}

export function getStuckItems(data: UserData, scores: Scores): StuckItem[] {
  const items: StuckItem[] = [];
  const name = data.name || 'Friend';

  if (scores.morningProtein <= 3) {
    const foodDesc = data.breakfast === 'Skip it' ? 'nothing' :
      data.breakfast === 'Coffee and pastry' ? 'sugar and caffeine' :
      data.breakfast === 'Cereal or toast' ? 'refined carbs' :
      data.breakfast === 'Fast food' ? 'fast food' : 'your current breakfast';
    items.push({
      title: 'The "Naked" Carb Habit',
      body: `Eating ${data.breakfast.toLowerCase()} alone causes insulin to skyrocket, shutting down fat burning instantly.`,
    });
  }

  if (scores.bloodSugar <= 3) {
    items.push({
      title: 'Afternoon Energy Crash',
      body: `Your energy drops to a ${data.energyAfternoon}/10 by afternoon. That's your blood sugar crashing — driving cravings and overeating.`,
    });
  }

  if (scores.hydration <= 6) {
    const targetOz = Math.round(data.weight * 0.5);
    items.push({
      title: 'Chronic Dehydration',
      body: `At ${data.weight} lbs you need ${targetOz}oz daily. Dehydration mimics hunger — some of your cravings are actually thirst.`,
    });
  }

  if (['4-7', 'Daily'].includes(data.sugaryDrinks)) {
    const drinksPerWeek = data.sugaryDrinks === 'Daily' ? 7 : 5;
    const weeklyCals = drinksPerWeek * 250;
    const monthlyLbs = ((weeklyCals * 4) / 3500).toFixed(1);
    items.push({
      title: 'Liquid Sugar Overload',
      body: `Sugary drinks ${data.sugaryDrinks.toLowerCase()}/week = ~${weeklyCals} hidden calories. That's ${monthlyLbs} lbs/month from drinks alone.`,
    });
  }

  if (scores.movement <= 3) {
    items.push({
      title: 'Movement Deficit',
      body: `Averaging ${data.dailySteps.toLowerCase()} steps/day. A 20-minute walk gets you to 7,000 — doubling your results.`,
    });
  }

  if (scores.accountability <= 3) {
    const coachNote = data.coachBefore === 'Never' ? "never had a coach" :
      data.coachBefore === "Yes but didn't work" ? "last coach didn't work" :
      "no one checking on your nutrition";
    items.push({
      title: 'Accountability Gap',
      body: `You said ${coachNote}. You already know what to eat — you need someone who notices when you fall off.`,
    });
  }

  if (['5-10 years', '10+ years'].includes(data.howLong)) {
    items.push({
      title: 'Restart Fatigue',
      body: `${data.howLong} of trying isn't failure — it's proof you haven't quit. We're only changing one thing this time.`,
    });
  }

  return items;
}

// Keep the old function for PDF backward compat
export function getStuckParagraphs(data: UserData, scores: Scores): string[] {
  return getStuckItems(data, scores).map(item => `${item.title}: ${item.body}`);
}

export function getMorningProtein(profile: ProfileType): string {
  switch (profile) {
    case 'skipper':
    case 'busy-mom':
      return 'Core Power Elite shake. 230 calories, 42g protein. Grab it from the fridge and drink it before 10 AM. No cooking. No prep. 60 seconds.';
    case 'sugar-crasher':
      return 'Option A: 2 scrambled eggs + 2 turkey sausage links. 38g protein, under 350 calories. Option B: Core Power Elite shake if you don\'t have time to cook. 42g protein.';
    case 'restaurant-regular':
      return 'Core Power Elite from the gas station or your office fridge. 42g protein. Drink it on the way to work before you eat anything else.';
    case 'repeat-starter':
      return 'One change. That\'s all. Core Power Elite shake or 2 eggs + turkey sausage before 10 AM. Everything else stays the same. Lunch doesn\'t change. Dinner doesn\'t change. Snacks don\'t change yet. Just the morning.';
  }
}

export function getStepSuggestion(data: UserData): string {
  if (['Desk job', 'Work from home'].includes(data.workType)) {
    return '15 minute walk at lunch. 15 minute walk after dinner. That gets you there.';
  }
  if (['On your feet', 'Shift work'].includes(data.workType)) {
    return "You're probably close already from work. Track your steps for 3 days. If you're under 7,000, add a 15 minute walk after your shift.";
  }
  if (['1-2 kids', '3+ kids'].includes(data.kids)) {
    return '20 minute walk with the kids after dinner. Steps for you, family time for them.';
  }
  return '15 minute walk in the morning. 15 minute walk after dinner. Simple and effective.';
}

export function getActionItems(data: UserData, scores: Scores): string[] {
  const items: string[] = [];

  items.push('Buy Core Power Elite shakes OR eggs and turkey sausage. Have your morning protein ready before Monday.');

  if (scores.hydration <= 3) {
    items.push("Buy a 32oz water bottle. Fill it twice a day. That's your minimum.");
  } else if (scores.movement <= 3) {
    items.push("Download a step tracker if you don't have one. Start tracking tomorrow.");
  } else if (['4-7', 'Daily'].includes(data.sugaryDrinks)) {
    items.push('Replace one sugary drink per day with water. Just one.');
  } else if (scores.bloodSugar <= 3) {
    items.push(`Stop eating ${data.breakfast.toLowerCase()}. Replace it with your assigned protein option starting Monday.`);
  } else {
    items.push('Set a daily alarm for your morning protein. Consistency is everything in Phase 1.');
  }

  items.push('Screenshot your steps at the end of every day this week. If you join the RIVEN community, you\'ll post them daily and we hold each other accountable.');

  return items;
}

export function getWaterTarget(data: UserData): string {
  if (data.sugaryDrinks === 'Daily' || data.sugaryDrinks === '4-7') return '60oz';
  if (data.sugaryDrinks === '1-3') return '70oz';
  return '90oz';
}
