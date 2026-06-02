const mongoose = require('mongoose');
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URI = "mongodb://127.0.0.1:27017/wanderlust";

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "69f8767a89f9ffeafa13efe3" }));
    await Listing.insertMany(initData.data);
    console.log(" Database initialized with sample data");
};

async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(' Connected to MongoDB');
        
        // 🔥 ADD THIS: Call initDB after connection
       // await initDB();
        
        // console.log('✅ Seeding complete!');
        // process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

main(); // 🔥 CHANGE: Remove .then/.catch - use try/catch inside