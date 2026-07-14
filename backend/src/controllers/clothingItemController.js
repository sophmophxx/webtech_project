import mongoose from "mongoose";
import ClothingItem from "../models/ClothingItem.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function isInvalidObjectId(id) {
    return !mongoose.Types.ObjectId.isValid(id);
}

export const getClothingItems = asyncHandler(async (req, res) => {
    const items = await ClothingItem.find().sort({ createdAt: -1 }).exec();

    res.json(items);
});

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

export const createClothingItem = asyncHandler(async (req, res) => {
    const newItem = await ClothingItem.create(req.body);

    res.status(201).json(newItem);
});

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
