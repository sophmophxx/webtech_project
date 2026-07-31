import mongoose from "mongoose";
import { z } from "zod";

const objectIdSchema = z
    .string()
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Ungültige Item-ID",
    });

/**
 * Validates the request body for creating a new outfit.
 * An outfit requires a name and at least one referenced clothing item.
 */
export const createOutfitSchema = z.object({
    name: z.string().trim().min(1).max(100),
    notes: z.string().trim().max(500).optional(),
    items: z
        .array(objectIdSchema)
        .min(1, "Mindestens ein Kleidungsstück muss ausgewählt werden")
        .refine((items) => new Set(items).size === items.length, {
            message: "Ein Kleidungsstück darf nur einmal ausgewählt werden",
        }),
    favorite: z.boolean().optional(),
});

/**
 * Validates the request body for partially updating an outfit.
 * At least one field must be provided.
 */
export const updateOutfitSchema = createOutfitSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        message: "Mindestens ein Feld muss aktualisiert werden",
    });
