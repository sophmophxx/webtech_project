import { z } from "zod";

const imageUrlSchema = z
    .string()
    .trim()
    .refine(
        (value) => {
            if (value.startsWith("/")) {
                return true;
            }

            try {
                const url = new URL(value);
                return url.protocol === "http:" || url.protocol === "https:";
            } catch {
                return false;
            }
        },
        {
            message: "Ungültige Bild-URL",
        }
    );

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
    imageUrl: imageUrlSchema.optional(),
    notes: z.string().trim().max(500).optional(),
    favorite: z.boolean().optional(),
});

export const updateClothingItemSchema = createClothingItemSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Mindestens ein Feld muss aktualisiert werden",
    });
