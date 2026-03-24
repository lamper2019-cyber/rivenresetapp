export interface RestaurantOrder {
  name: string;
  order: string;
  calories: number;
  protein: number;
  altOrder?: string;
  altCalories?: number;
  altProtein?: number;
}

export const restaurantOrders: Record<string, RestaurantOrder> = {
  'Chick-fil-A': {
    name: 'Chick-fil-A',
    order: '12ct grilled nuggets + side salad or fruit cup + water',
    calories: 200,
    protein: 38,
    altOrder: '30ct grilled nuggets + fruit cup + water',
    altCalories: 510,
    altProtein: 98,
  },
  'Chipotle': {
    name: 'Chipotle',
    order: 'Chicken bowl, double chicken, black beans, fajita veggies, salsa, lettuce. No rice, no sour cream, no guac.',
    calories: 560,
    protein: 72,
  },
  'Panda Express': {
    name: 'Panda Express',
    order: 'Double grilled teriyaki chicken + super greens + water',
    calories: 550,
    protein: 66,
  },
  "McDonald's": {
    name: "McDonald's",
    order: '2 McChicken no mayo + side salad + water',
    calories: 520,
    protein: 38,
  },
  "Wendy's": {
    name: "Wendy's",
    order: 'Grilled chicken sandwich no mayo + side salad + water',
    calories: 370,
    protein: 35,
  },
  'Subway': {
    name: 'Subway',
    order: '6 inch turkey breast on wheat, all veggies, mustard. No mayo, no cheese.',
    calories: 280,
    protein: 18,
  },
  'Panera Bread': {
    name: 'Panera Bread',
    order: 'Half turkey sandwich + cup of ten vegetable soup + water',
    calories: 380,
    protein: 28,
  },
  'Shake Shack': {
    name: 'Shake Shack',
    order: 'Single ShackBurger lettuce wrap + water',
    calories: 400,
    protein: 28,
  },
  'Taco Bell': {
    name: 'Taco Bell',
    order: 'Power Menu Bowl chicken',
    calories: 470,
    protein: 26,
  },
  'Starbucks': {
    name: 'Starbucks',
    order: 'Egg white & roasted red pepper egg bites (2) + black coffee',
    calories: 340,
    protein: 26,
  },
  'Cava': {
    name: 'Cava',
    order: 'Greens + chicken, double protein, all non-creamy toppings, lemon herb tahini',
    calories: 480,
    protein: 52,
  },
  'Five Guys': {
    name: 'Five Guys',
    order: 'Little hamburger lettuce wrap + water. Skip the fries.',
    calories: 340,
    protein: 20,
  },
  'Dunkin\'': {
    name: 'Dunkin\'',
    order: 'Wake-Up Wrap (egg & cheese) x2 + black coffee',
    calories: 380,
    protein: 24,
  },
  'Buffalo Wild Wings': {
    name: 'Buffalo Wild Wings',
    order: '8 plain boneless wings + celery + ranch on side',
    calories: 480,
    protein: 44,
  },
  'In-N-Out': {
    name: 'In-N-Out',
    order: 'Double-Double protein style (lettuce wrap) + water',
    calories: 520,
    protein: 33,
  },
  'Texas Roadhouse': {
    name: 'Texas Roadhouse',
    order: '6oz sirloin + steamed veggies + side salad + water',
    calories: 440,
    protein: 48,
  },
  'Waffle House': {
    name: 'Waffle House',
    order: '2 eggs + grilled chicken + toast',
    calories: 420,
    protein: 42,
  },
  'Jersey Mike\'s': {
    name: 'Jersey Mike\'s',
    order: 'Mini turkey sub on wheat, all veggies, oil & vinegar. No mayo.',
    calories: 340,
    protein: 22,
  },
  'Olive Garden': {
    name: 'Olive Garden',
    order: 'Herb-grilled salmon + steamed broccoli + side salad with dressing on side',
    calories: 460,
    protein: 44,
  },
  'Applebee\'s': {
    name: 'Applebee\'s',
    order: 'Blackened chicken salad, dressing on side + water',
    calories: 390,
    protein: 40,
  },
};

export const restaurantList = Object.keys(restaurantOrders);
