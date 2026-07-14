import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGO_URI"];

requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

export const env = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    clientUrl: process.env.CLIENT_URL || "http://localhost:4200",
    nodeEnv: process.env.NODE_ENV || "development",
};
