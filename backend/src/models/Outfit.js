import mongoose from "mongoose";

/**
 * Defines an outfit as a curated collection of existing clothing items.
 * Clothing items are referenced by their MongoDB ids instead of being duplicated.
 */
const outfitSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        items: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ClothingItem",
                required: true,
            },
        ],
        favorite: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

/**
 * Mongoose model used to read and write outfit documents.
 */
const Outfit = mongoose.model("Outfit", outfitSchema, "outfits");

export default Outfit;
