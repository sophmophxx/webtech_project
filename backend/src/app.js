import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import clothingItemRoutes from "./routes/clothingItemRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: env.clientUrl,
    })
);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
    res.send("Backend läuft");
});

app.use("/api/health", healthRoutes)
app.use("/api/items", clothingItemRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
