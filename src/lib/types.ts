export interface UserData {
  name: string;
  age: number;
  heightFt: number;
  heightIn: number;
  weight: number;
  goalWeight: number;
  howLong: string;
  triedBefore: string[];
  whyNow: string;
  sleepQuality: number;
  stressLevel: number;
  workType: string;
  kids: string;
  breakfast: string;
  snackTime: string;
  sugaryDrinks: string;
  restaurants: string[];
  dailySteps: string;
  movementBarriers: string[];
  coachBefore: string;
  energyMorning: number;
  energyAfternoon: number;
  eatingOut: string;
  dinner: string;
  lunch: string;
  readiness: number;
  whyStopped: string;
  nutritionCheck: string;
}

export interface Scores {
  morningProtein: number;
  bloodSugar: number;
  hydration: number;
  movement: number;
  eliminations: number;
  accountability: number;
  total: number;
}

export type ProfileType = 'skipper' | 'sugar-crasher' | 'busy-mom' | 'restaurant-regular' | 'repeat-starter';

export interface ScoreColor {
  color: 'red' | 'yellow' | 'green';
  label: string;
  hex: string;
}

export const getScoreColor = (score: number): ScoreColor => {
  if (score <= 3) return { color: 'red', label: 'Critical', hex: '#E74C3C' };
  if (score <= 6) return { color: 'yellow', label: 'Needs Work', hex: '#F1C40F' };
  return { color: 'green', label: 'Optimal', hex: '#2ECC71' };
};

export const defaultUserData: UserData = {
  name: '',
  age: 28,
  heightFt: 5,
  heightIn: 5,
  weight: 180,
  goalWeight: 150,
  howLong: '',
  triedBefore: [],
  whyNow: '',
  sleepQuality: 5,
  stressLevel: 5,
  workType: '',
  kids: '',
  breakfast: '',
  snackTime: '',
  sugaryDrinks: '',
  restaurants: [],
  dailySteps: '',
  movementBarriers: [],
  coachBefore: '',
  energyMorning: 5,
  energyAfternoon: 5,
  eatingOut: '',
  dinner: '',
  lunch: '',
  readiness: 7,
  whyStopped: '',
  nutritionCheck: '',
};
