import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Connects the application to MongoDB.
 * Exits the process if the database connection cannot be established.
 *
 * @returns {Promise<void>}
 */
export async function connectDB() {
    try {
        await mongoose.connect(env.mongoUri);
        console.log("Datenbank verbunden");
    } catch (e) {
        console.log("Fehler bei Datenbank-Verbindung: " + e.message);
        process.exit(1);
    }
}
