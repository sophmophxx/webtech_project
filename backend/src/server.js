import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectDB();


    app.listen(PORT, () => {
        console.log(`Server läuft auf Port ${PORT}`);
    });
}

startServer().catch(() => {
    console.error("Server konnte nicht gestartet werden");
    process.exit(1);
});