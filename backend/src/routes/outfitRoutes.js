import express from "express";
import {
    getOutfits,
    getOutfitById,
    createOutfit,
    updateOutfit,
    deleteOutfit,
} from "../controllers/outfitController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
    createOutfitSchema,
    updateOutfitSchema,
} from "../validators/outfitValidator.js";

const router = express.Router();

/**
 * Defines the REST endpoints for outfit CRUD operations.
 * Create and update requests are validated before reaching the controller.
 */
router.get("/", getOutfits);
router.get("/:id", getOutfitById);

router.post("/", validateRequest(createOutfitSchema), createOutfit);

router.patch("/:id", validateRequest(updateOutfitSchema), updateOutfit);

router.delete("/:id", deleteOutfit);

export default router;
