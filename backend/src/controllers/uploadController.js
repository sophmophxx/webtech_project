import { Readable } from "node:stream";

import { cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function isCloudinaryConfigured() {
    return (
        env.cloudinary.cloudName &&
        env.cloudinary.apiKey &&
        env.cloudinary.apiSecret
    );
}

function uploadBufferToCloudinary(buffer) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "wardrobe-archive",
                resource_type: "image",
                transformation: [
                    {
                        width: 1200,
                        height: 1200,
                        crop: "limit",
                        quality: "auto",
                        fetch_format: "auto",
                    },
                ],
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
}

/**
 * Uploads an image file to Cloudinary and returns the hosted image URL.
 */
export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError("No image file provided", 400);
    }

    if (!isCloudinaryConfigured()) {
        throw new AppError("Image upload is not configured", 500);
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer);

    res.status(201).json({
        imageUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
    });
});
