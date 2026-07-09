import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend läuft");
})

const PORT = process.env.PORT || 3000;

async function startServer() {
    await connectDB();
}

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});

startServer().catch(() => {
    console.error("Server konnte nicht gestartet werden");
    process.exit(1);
});