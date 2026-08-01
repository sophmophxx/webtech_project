import express from "express";

import { uploadImage } from "../controllers/uploadController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/**
 * Handles image uploads for wardrobe items.
 * The uploaded file must be sent as multipart/form-data with the field name "image".
 */
router.post("/", upload.single("image"), uploadImage);

export default router;
