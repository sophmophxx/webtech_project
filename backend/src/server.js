import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server läuft auf Port ${env.port}`);
    });
}

startServer().catch(() => {
    console.error("Server konnte nicht gestartet werden");
    process.exit(1);
});
