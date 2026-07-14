import express from "express";
import {
    getClothingItems,
    getClothingItemById,
    createClothingItem,
    updateClothingItem,
    deleteClothingItem,
} from "../controllers/clothingItemController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
    createClothingItemSchema,
    updateClothingItemSchema,
} from "../validators/clothingItemValidator.js";

const router = express.Router();

router.get("/", getClothingItems);
router.get("/:id", getClothingItemById);

router.post("/", validateRequest(createClothingItemSchema), createClothingItem);

router.patch(
    "/:id",
    validateRequest(updateClothingItemSchema),
    updateClothingItem
);

router.delete("/:id", deleteClothingItem);

export default router;
