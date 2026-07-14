import { z } from "zod";

export const createClothingItemSchema = z.object({
    name: z.string().trim().min(1).max(100),
    category: z.enum([
        "tops",
        "bottoms",
        "dresses",
        "outerwear",
        "shoes",
        "bags",
        "accessories",
        "other",
    ]),
    brand: z.string().trim().max(100).optional(),
    color: z.string().trim().max(50).optional(),
    size: z.string().trim().max(20).optional(),
    imageUrl: z.string().trim().url().optional(),
    notes: z.string().trim().max(500).optional(),
    favorite: z.boolean().optional(),
});

export const updateClothingItemSchema = createClothingItemSchema.partial();
