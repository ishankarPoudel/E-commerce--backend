import AppDataSource from "../config/data-source/data-source";
import { BagEntity, BagType } from "../entities/bag/bag.entity";
import { Category } from "../entities/category/category.entity";
import { MediaEntity } from "../entities/media/media.entity";

type BagSeed = {
  name: string;
  type: BagType;
  price: number;
  description?: string;
  brand?: string;
  material?: string;
  colors?: string[];
  sizes?: string[];
  weightKg?: number;
  capacityLiters?: number;
  isFeatured?: boolean;
  categoryNames: string[];
  imageUrls: string[]; // public URLs
  features?: Record<string, boolean>;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1520975919029-4f5f7aa1e8c9?auto=format&fit=crop&w=1200&q=80";

const SEEDS: BagSeed[] = [
  {
    name: "Classic Leather Satchel",
    type: BagType.HANDBAG,
    price: 129,
    description: "Timeless classic leather satchel handcrafted for daily use.",
    brand: "Apex Leather Co.",
    material: "Full-grain leather",
    colors: ["brown", "black"],
    sizes: ["one-size"],
    weightKg: 1.2,
    capacityLiters: 6,
    isFeatured: true,
    categoryNames: ["Leather Bags", "Handbags"],
    imageUrls: [
      "https://images.unsplash.com/photo-1585386959984-a4155224f2f0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520975919029-4f5f7aa1e8c9?auto=format&fit=crop&w=1200&q=80",
    ],
    features: { waterResistant: false, removableStrap: true },
  },
  {
    name: "Urban Canvas Backpack",
    type: BagType.BACKPACK,
    price: 89,
    description:
      "Durable canvas backpack with laptop sleeve and organizer pockets.",
    brand: "Nomad Goods",
    material: "Waxed canvas",
    colors: ["olive", "navy"],
    sizes: ["15inch-laptop"],
    weightKg: 0.95,
    capacityLiters: 18,
    isFeatured: false,
    categoryNames: ["Backpacks", "Travel Bags"],
    imageUrls: [
      "https://images.unsplash.com/photo-1572407084939-bfd0d12ffeb5?auto=format&fit=crop&w=1200&q=80",
    ],
    features: { laptopCompartment: true, waterResistant: true },
  },
  {
    name: "Weekend Duffel Bag",
    type: BagType.DUFFEL,
    price: 109,
    description:
      "Spacious weekend duffel, perfect for short trips and gym use.",
    brand: "Voyage Labs",
    material: "Nylon",
    colors: ["black", "charcoal"],
    sizes: ["large"],
    weightKg: 1.6,
    capacityLiters: 40,
    isFeatured: false,
    categoryNames: ["Travel Bags", "Duffels"],
    imageUrls: [
      "https://images.unsplash.com/photo-1526178614977-1c4f4f6f6026?auto=format&fit=crop&w=1200&q=80",
    ],
    features: { shoeCompartment: true, waterResistant: true },
  },
  {
    name: "Everyday Tote",
    type: BagType.TOTE,
    price: 59,
    description:
      "Lightweight everyday tote with internal pockets and durable handles.",
    brand: "City Carry",
    material: "Canvas",
    colors: ["beige", "black"],
    sizes: ["one-size"],
    weightKg: 0.5,
    capacityLiters: 10,
    isFeatured: true,
    categoryNames: ["Tote Bags", "Casual"],
    imageUrls: [
      "https://images.unsplash.com/photo-1503342452485-86f7c8a04f44?auto=format&fit=crop&w=1200&q=80",
    ],
    features: { foldable: true },
  },
  {
    name: "Crossbody Mini Satchel",
    type: BagType.CROSSBODY,
    price: 69,
    description: "Compact crossbody bag for hands-free convenience.",
    brand: "Streetline",
    material: "PU leather",
    colors: ["tan", "black"],
    sizes: ["small"],
    weightKg: 0.35,
    capacityLiters: 2,
    isFeatured: false,
    categoryNames: ["Crossbody", "Handbags"],
    imageUrls: [
      "https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?auto=format&fit=crop&w=1200&q=80",
    ],
    features: { adjustableStrap: true },
  },
];

export async function seedBags() {
  const bagRepo = AppDataSource.getRepository(BagEntity);
  const categoryRepo = AppDataSource.getRepository(Category);
  const mediaRepo = AppDataSource.getRepository(MediaEntity);

  for (const seed of SEEDS) {
    // Idempotent: skip if a bag with the same name exists
    const exists = await bagRepo.findOne({ where: { name: seed.name } });
    if (exists) {
      console.log(`Skipping (already exists): ${seed.name}`);
      continue;
    }

    // Find or create categories
    const categories: Category[] = [];
    for (const catName of seed.categoryNames) {
      let cat = await categoryRepo.findOne({
        where: { categoryName: catName },
      });
      if (!cat) {
        cat = categoryRepo.create({ categoryName: catName });
        await categoryRepo.save(cat);
        console.log(`Created category: ${catName}`);
      }
      categories.push(cat);
    }

    // Create image entities (correct fields: image, altText)
    const imageUrls =
      seed.imageUrls && seed.imageUrls.length > 0
        ? seed.imageUrls
        : [PLACEHOLDER_IMAGE];

    const images = imageUrls.map((url, idx) =>
      mediaRepo.create({
        image: url,
        altText: `${seed.name} ${idx + 1}`,
      })
    );

    // Create the bag (cascade insert on images relation must be enabled in BagEntity)
    const bag = bagRepo.create({
      name: seed.name,
      type: seed.type,
      price: seed.price,
      description: seed.description,
      brand: seed.brand,
      material: seed.material,
      colors: seed.colors,
      sizes: seed.sizes,
      weightKg: seed.weightKg,
      capacityLiters: seed.capacityLiters,
      isFeatured: seed.isFeatured ?? false,
      features: seed.features,
      categories,
      images, // relies on cascade: ["insert"] on BagEntity.images
    } as Partial<BagEntity>);

    await bagRepo.save(bag);
    console.log(`Seeded bag: ${seed.name}`);
  }

  console.log("Bag seeding completed ✅");
}
