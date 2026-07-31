import mongoose from "mongoose";
import ClothingItem from "../models/ClothingItem.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Checks whether a given value is not a valid MongoDB ObjectId.
 *
 * @param {string} id - The id value from the request parameters.
 * @returns {boolean} True if the id is invalid.
 */
function isInvalidObjectId(id) {
    return !mongoose.Types.ObjectId.isValid(id);
}

/**
 * Returns all clothing items sorted by creation date, newest first.
 */
export const getClothingItems = asyncHandler(async (req, res) => {
    const items = await ClothingItem.find().sort({ createdAt: -1 }).exec();

    res.json(items);
});

/**
 * Returns a single clothing item by its MongoDB id.
 * Throws a 400 error for invalid ids and a 404 error if no item exists.
 */
export const getClothingItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
        throw new AppError("Ungültige Item-ID", 400);
    }

    const item = await ClothingItem.findById(id).exec();

    if (!item) {
        throw new AppError("Item nicht gefunden", 404);
    }

    res.json(item);
});

/**
 * Creates a new clothing item from the validated request body.
 */
export const createClothingItem = asyncHandler(async (req, res) => {
    const newItem = await ClothingItem.create(req.body);

    res.status(201).json(newItem);
});

/**
 * Updates an existing clothing item by id.
 * Returns the updated item and runs schema validation during the update.
 * Throws a 400 error for invalid ids and a 404 error if no item exists.
 */
export const updateClothingItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
        throw new AppError("Ungültige Item-ID", 400);
    }

    const updatedItem = await ClothingItem.findByIdAndUpdate(id, req.body, {
        returnDocument: "after",
        runValidators: true,
    }).exec();

    if (!updatedItem) {
        throw new AppError("Item nicht gefunden", 404);
    }

    res.json(updatedItem);
});

/**
 * Deletes a clothing item by id.
 * Throws a 400 error for invalid ids and a 404 error if no item exists.
 */
export const deleteClothingItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (isInvalidObjectId(id)) {
        throw new AppError("Ungültige Item-ID", 400);
    }

    const deletedItem = await ClothingItem.findByIdAndDelete(id).exec();

    if (!deletedItem) {
        throw new AppError("Item nicht gefunden", 404);
    }

    res.json({ message: "Item gelöscht" });
});
