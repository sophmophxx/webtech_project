import mongoose from "mongoose";

export async function connectDB() {
    try  {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Datenbank verbunden");
    } catch (e) {
        console.log("Fehler bei Datenbank-Verbindung: " + e.message);
        process.exit(1);
    }
}