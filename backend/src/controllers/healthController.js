import { env } from "../config/env.js";

/**
 * Returns basic health information about the running API.
 * Used to check whether the backend is available.
 */
export function getHealth(req, res) {
    res.status(200).json({
        status: "ok",
        environment: env.nodeEnv,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
}
