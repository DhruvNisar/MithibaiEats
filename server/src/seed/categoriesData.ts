export interface CategorySeed {
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
}

export const categoriesData: CategorySeed[] = [
  { name: 'Breakfast', slug: 'breakfast', icon: '🍳', sortOrder: 1 },
  { name: 'South Indian', slug: 'south-indian', icon: '🥞', sortOrder: 2 },
  { name: 'North Indian', slug: 'north-indian', icon: '🍲', sortOrder: 3 },
  { name: 'Meals & Thalis', slug: 'meals', icon: '🍱', sortOrder: 4 },
  { name: 'Rice & Khichdi', slug: 'rice', icon: '🍚', sortOrder: 5 },
  { name: 'Biryani', slug: 'biryani', icon: '🥘', sortOrder: 6 },
  { name: 'Chinese', slug: 'chinese', icon: '🥡', sortOrder: 7 },
  { name: 'Indo-Chinese', slug: 'indo-chinese', icon: '🥢', sortOrder: 8 },
  { name: 'Fast Food', slug: 'fast-food', icon: '🍟', sortOrder: 9 },
  { name: 'Sandwiches', slug: 'sandwiches', icon: '🥪', sortOrder: 10 },
  { name: 'Burgers', slug: 'burgers', icon: '🍔', sortOrder: 11 },
  { name: 'Pizza', slug: 'pizza', icon: '🍕', sortOrder: 12 },
  { name: 'Pasta', slug: 'pasta', icon: '🍝', sortOrder: 13 },
  { name: 'Maggi Specials', slug: 'maggi', icon: '🍜', sortOrder: 14 },
  { name: 'Frankies', slug: 'frankies', icon: '🌯', sortOrder: 15 },
  { name: 'Wraps', slug: 'wraps', icon: '🌯', sortOrder: 16 },
  { name: 'Rolls', slug: 'rolls', icon: '🥙', sortOrder: 17 },
  { name: 'Pav Specials', slug: 'pav', icon: '🥖', sortOrder: 18 },
  { name: 'Chaat', slug: 'chaat', icon: '🥗', sortOrder: 19 },
  { name: 'Snacks', slug: 'snacks', icon: '🥟', sortOrder: 20 },
  { name: 'Bakery', slug: 'bakery', icon: '🥐', sortOrder: 21 },
  { name: 'Desserts', slug: 'desserts', icon: '🍰', sortOrder: 22 },
  { name: 'Ice Cream', slug: 'ice-cream', icon: '🍨', sortOrder: 23 },
  { name: 'Tea & Chai', slug: 'tea', icon: '☕', sortOrder: 24 },
  { name: 'Coffee', slug: 'coffee', icon: '☕', sortOrder: 25 },
  { name: 'Juices', slug: 'juices', icon: '🧃', sortOrder: 26 },
  { name: 'Shakes', slug: 'shakes', icon: '🥤', sortOrder: 27 },
  { name: 'Combos', slug: 'combos', icon: '🍽️', sortOrder: 28 },
  { name: 'Healthy Food', slug: 'healthy-food', icon: '🥗', sortOrder: 29 },
  { name: 'Jain Food', slug: 'jain-food', icon: '🌿', sortOrder: 30 },
];
