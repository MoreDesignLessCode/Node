export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  longDescription: string;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Tide Laundry Detergent',
    price: 5.99,
    description: 'Tide Laundry Detergent Liquid Soap, Original Scent, 64 Loads',
    image: 'http://localhost:8080/tide.webp',
    longDescription:
      'America’s #1 detergent*, now even better. This Tide liquid laundry detergent has an improved formula engineered to attack tough body soils.',
  },
  {
    id: 2,
    name: 'Olay Regenerist',
    price: 23.99,
    description:
      'Olay Regenerist Micro-Sculpting Cream Face Moisturizer 1.7 oz',
    image: 'http://localhost:8080/olay.webp',
    longDescription:
      "Regenerist is Olay's Advanced Anti-Aging Skin Care Collection. Micro-Sculpting Face Moisturizer Formula is designed with Advanced Anti-Aging ingredients for visible wrinkle results starting day 1.",
  },
  {
    id: 3,
    name: 'Crest Toothpaste',
    price: 3.72,
    description: 'Crest Pro-Health Advanced Gum Protection Toothpaste, 5.1 oz',
    image: 'http://localhost:8080/crest.webp',
    longDescription:
      'Crest Pro-Health Advanced gives you a powerful clean and all-in-one protection of the 8 key areas that dentists check most.',
  },
  {
    id: 5,
    name: 'Pantene Shampoo',
    price: 13.92,
    description: 'Pantene Pro-V Classic Clean Shampoo, 12.6 Fl Oz (Pack of 2)',
    image: 'http://localhost:8080/pantene.webp',
    longDescription:
      'Hit refresh on your hair when you use Pantene Pro-V Classic Clean Shampoo. This antioxidant-rich shampoo gently cleanses hair, removing styling buildup, leaving your mane shiny from root to tip.',
  },
];

export default products;
