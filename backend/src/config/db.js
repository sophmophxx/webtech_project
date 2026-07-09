import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
    try  {
        await mongoose.connect(env.mongoUri);
        console.log("Datenbank verbunden");
    } catch (e) {
        console.log("Fehler bei Datenbank-Verbindung: " + e.message);
        process.exit(1);
    }
}