import mongoose from "mongoose";

const clothingItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "tops",
                "bottoms",
                "dresses",
                "outerwear",
                "shoes",
                "bags",
                "accessories",
                "other",
            ],
        },
        brand: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        color: {
            type: String,
            trim: true,
            maxlength: 50,
        },
        size: {
            type: String,
            trim: true,
            maxlength: 20,
        },
        imageUrl: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500,
        },
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

const ClothingItem = mongoose.model(
    "ClothingItem",
    clothingItemSchema,
    "clothingItems"
);

export default ClothingItem;
