import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js"

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: env.clientURL,
    })
);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

app.use(express.json({limit: "10kb"}));

app.get("/", (req, res) => {
    res.send("Backend läuft")
});

export default app;