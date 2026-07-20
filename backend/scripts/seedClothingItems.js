import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { env } from "../src/config/env.js";
import ClothingItem from "../src/models/ClothingItem.js";

const sampleItems = [
    {
        name: "Black Draped Dress",
        category: "dresses",
        brand: "Ann Demeulemeester",
        color: "black",
        size: "S",
        imageUrl: "/images/seed/black-dress.jpg",
        notes: "Clean silhouette, evening piece",
        favorite: true,
    },
    {
        name: "Silver Shoulder Bag",
        category: "bags",
        brand: "Jil Sander",
        color: "silver",
        size: "One Size",
        imageUrl: "/images/seed/silver-bag.jpg",
        notes: "Minimal metallic bag",
        favorite: false,
    },
    {
        name: "Vintage Leather Boots",
        category: "shoes",
        brand: "Ann Demeulemeester",
        color: "black",
        size: "40",
        imageUrl: "/images/seed/black-boots.jpg",
        notes: "Platform boots",
        favorite: true,
    },
    {
        name: "Oversized Wool Coat",
        category: "outerwear",
        brand: "Celine",
        color: "grey",
        size: "S",
        imageUrl: "/images/seed/grey-coat.jpg",
        notes: "Heavy winter coat",
        favorite: false,
    },
    {
        name: "White Ribbed Tank Top",
        category: "tops",
        brand: "COS",
        color: "white",
        size: "XS",
        imageUrl: "/images/seed/white-tank.jpg",
        notes: "Basic layering piece",
        favorite: false,
    },
    {
        name: "Low Waist Maxi Skirt",
        category: "bottoms",
        brand: "Rick Owens",
        color: "brown",
        size: "S",
        imageUrl: "/images/seed/brown-skirt.jpg",
        notes: "Straight silhouette",
        favorite: true,
    },
    {
        name: "Statement Sunglasses",
        category: "accessories",
        brand: "Dior",
        color: "silver",
        size: "One Size",
        imageUrl: "/images/seed/sunglasses.jpg",
        notes: "Rhinestones",
        favorite: false,
    },
];

async function seedClothingItems() {
    const shouldReset = process.argv.includes("--reset");

    if (env.nodeEnv === "production") {
        throw new Error("Seeding is disabled in production.");
    }

    await connectDB();

    if (shouldReset) {
        await ClothingItem.deleteMany({});
        console.log("Existing clothing items deleted.");
    }

    const createdItems = await ClothingItem.insertMany(sampleItems);

    console.log(`${createdItems.length} clothing items inserted.`);

    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
}

seedClothingItems().catch(async (error) => {
    console.error("Seeding failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
});
