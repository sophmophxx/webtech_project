import { env } from "../config/env.js";

export function getHealth(req, res) {
    res.status(200).json({
        status: "ok",
        environment: env.nodeEnv,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
}