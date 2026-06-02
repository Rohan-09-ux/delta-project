// migrate-maps.js
require("dotenv").config(); // Loads your MAP_TOKEN from your .env file
const mongoose = require("mongoose");
const axios = require("axios");
const Listing = require("./models/listing"); // Adjust path if your model is in a different folder

const mapToken = process.env.MAP_TOKEN;

if (!mapToken) {
    console.error("❌ Error: MAP_TOKEN is missing from your environment variables!");
    process.exit(1);
}

// CONNECT TO MONGO DATABASE (Adjust connection string if necessary)
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; 
mongoose.connect(MONGO_URL)
    .then(() => console.log("💾 Database connected for MapTiler migration..."))
    .catch(err => console.error("Database connection error:", err));

async function migrateOldListings() {
    try {
        // Find listings that don't have geometry, have null geometry, or are missing coordinates
        const oldListings = await Listing.find({
            $or: [
                { geometry: { $exists: false } },
                { geometry: null },
                { "geometry.coordinates": { $exists: false } }
            ]
        });

        console.log(`🔍 Found ${oldListings.length} older listings needing MapTiler coordinates.\n`);

        for (let listing of oldListings) {
            // Replicate the location string from your controller
            const locationQuery = listing.location;
            console.log(`🌍 Geocoding: "${locationQuery}, ${listing.country}"...`);

            try {
                // Call MapTiler API exactly like your createListing controller does
                const geoResponse = await axios.get(
                    `https://api.maptiler.com/geocoding/${encodeURIComponent(locationQuery)}.json?key=${mapToken}`
                );

                if (geoResponse.data.features && geoResponse.data.features.length > 0) {
                    const coordinates = geoResponse.data.features[0].geometry.coordinates;
                    
                    listing.geometry = {
                        type: "Point",
                        coordinates: coordinates
                    };

                    await listing.save();
                    console.log(`   ✅ Success: Saved coordinates for "${listing.title}"`);
                } else {
                    console.log(`   ❌ Failed: MapTiler found no results for "${locationQuery}"`);
                }
            } catch (apiErr) {
                console.error(`   ⚠️ API Error processing "${listing.title}":`, apiErr.message);
            }

            // Optional tiny delay to pace out requests nicely
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        console.log("\n🏁 --- Migration Complete! All old listings updated. ---");
    } catch (error) {
        console.error("Migration encountered a critical error:", error);
    } finally {
        mongoose.connection.close();
    }
}

migrateOldListings();