import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGO_URI"];

requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

/**
 * Converts a comma-separated list of client URLs into an array.
 * This allows multiple frontend origins to be used for CORS configuration.
 *
 * @param {string} value - Comma-separated list of client URLs.
 * @returns {string[]} Parsed and trimmed client URLs.
 */
function parseClientUrls(value) {
    return value
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
}

/**
 * Centralized environment configuration for the application.
 * Provides default values for local development where appropriate.
 */
export const env = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    clientUrls: parseClientUrls(
        process.env.CLIENT_URL || "http://localhost:4200"
    ),
    nodeEnv: process.env.NODE_ENV || "development",

    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
};
