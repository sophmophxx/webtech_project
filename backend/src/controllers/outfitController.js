import mongoose from "mongoose";
import ClothingItem from "../models/ClothingItem.js";
import Outfit from "../models/Outfit.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function isInvalidObjectId(id) {
    return !mongoose.Types.ObjectId.isValid(id);
}

/**
 * Ensures that all clothing item ids referenced by an outfit exist in the database.
 */
async function validateReferencedItems(itemIds) {
    if (!itemIds) {
        return;
    }

    const existingItemsCount = await ClothingItem.countDocuments({
        _id: { $in: itemIds },
    });

    if (existingItemsCount !== itemIds.length) {
        throw new AppError(
            "Ein oder mehrere Kleidungsstücke wurden nicht gefunden",
            400
        );
    }
}

/**
 * Returns all outfits sorted by creation date, newest first.
 * Referenced clothing items are populated for frontend display.
 */
export const getOutfits = asyncHandler(async (_req, res) => {
    const outfits = await Outfit.find()
        .populate("items")
        .sort({ createdAt: -1 })
        .exec();

    res.json(outfits);
});

/**
 * Returns a single outfit by its MongoDB id.
 */
export const getOutfitById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
        throw new AppError("Ungültige Outfit-ID", 400);
    }

    const outfit = await Outfit.findById(id).populate("items").exec();

    if (!outfit) {
        throw new AppError("Outfit nicht gefunden", 404);
    }

    res.json(outfit);
});

/**
 * Creates a new outfit from existing clothing item references.
 */
export const createOutfit = asyncHandler(async (req, res) => {
    await validateReferencedItems(req.body.items);

    const newOutfit = await Outfit.create(req.body);
    await newOutfit.populate("items");

    res.status(201).json(newOutfit);
});

/**
 * Updates an existing outfit.
 * If clothing item references are changed, they are validated before saving.
 */
export const updateOutfit = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
        throw new AppError("Ungültige Outfit-ID", 400);
    }

    await validateReferencedItems(req.body.items);

    const updatedOutfit = await Outfit.findByIdAndUpdate(id, req.body, {
        returnDocument: "after",
        runValidators: true,
    })
        .populate("items")
        .exec();

    if (!updatedOutfit) {
        throw new AppError("Outfit nicht gefunden", 404);
    }

    res.json(updatedOutfit);
});

/**
 * Deletes an outfit by id.
 */
export const deleteOutfit = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
        throw new AppError("Ungültige Outfit-ID", 400);
    }

    const deletedOutfit = await Outfit.findByIdAndDelete(id).exec();

    if (!deletedOutfit) {
        throw new AppError("Outfit nicht gefunden", 404);
    }

    res.json({ message: "Outfit gelöscht" });
});
