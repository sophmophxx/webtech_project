import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

/**
 * Starts the backend server after a successful database connection.
 * The application exits if either the database connection or server startup fails.
 */
async function startServer() {
    await connectDB();

    app.listen(env.port, () => {
        console.log(`Server läuft auf Port ${env.port}`);
    });
}

startServer().catch((error) => {
    console.error("Server konnte nicht gestartet werden:", error);
    process.exit(1);
});
