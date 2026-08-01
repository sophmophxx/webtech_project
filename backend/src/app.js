import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import clothingItemRoutes from "./routes/clothingItemRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

// Adds common security-related HTTP headers.
app.use(helmet());

// Allows requests only from configured frontend origins.
app.use(
    cors({
        origin(origin, callback) {
            if (!origin || env.clientUrls.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error(`CORS blocked for origin: ${origin}`));
        },
    })
);

// Limits repeated requests to reduce abuse and accidental overload.
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Parses JSON request bodies and limits their size.
app.use(express.json({ limit: "10kb" }));

// Basic root endpoint for manual checks in the browser.
app.get("/", (_req, res) => {
    res.send("Backend läuft");
});

// Versioned API routes.
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/items", clothingItemRoutes);
app.use("/api/v1/outfits", outfitRoutes);
app.use("/api/v1/uploads", uploadRoutes);

// Fallback and centralized error handling.
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
