const axios = require("axios");
const mapToken = process.env.MAP_TOKEN;
const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings, title: 'All Listings' });
};
 module.exports.renderNewForm = (req, res) => {
    res.render("listings/new", { title: 'New Listing' });
};

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const foundListing = await Listing.findById(id)
      .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
      })
        .populate('owner');
    if (!foundListing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    console.log(foundListing);
    res.render("listings/show", { listing: foundListing, title: foundListing.title });
};



module.exports.createListing = async (req, res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url,"..",filename);
    console.log("📸 Uploaded file:", { url, filename }); // 👈 ADD THIS
    console.log("📝 Raw form data:", req.body); // 👈 ADD THIS
    
    const data = req.body.listing;
    console.log("📦 Listing data:", data); // 👈 ADD THIS

    // 🛑 Stop if no data
    if (!data) {
        console.log("❌ No form data received");
        req.flash('error', 'Form data not received');
        return res.redirect("/listings/new");
    }

    const { title, description, price, location, country, image } = data;
            const geoResponse = await axios.get(
            `https://api.maptiler.com/geocoding/${location}.json?key=${mapToken}`
        );

        const coordinates = geoResponse.data.features[0].geometry.coordinates;
    console.log("🔍 Extracted:", { title, description, price, location, country }); // 👈 ADD THIS

    // VALIDATION
    if (!title || title.trim().length < 3) {
        console.log("❌ Title validation failed:", title);
        req.flash('error', 'Title must be at least 3 characters');
        return res.redirect("/listings/new");
    }

    if (!description || description.trim().length < 10) {
        console.log("❌ Description validation failed:", description);
        req.flash('error', 'Description must be at least 10 characters');
        return res.redirect("/listings/new");
    }

    if (!price || isNaN(price) || parseFloat(price) <= 0) {
        console.log("❌ Price validation failed:", price);
        req.flash('error', 'Price must be a number greater than 0');
        return res.redirect("/listings/new");
    }

    if (!location || location.trim().length < 2) {
        console.log("❌ Location validation failed:", location);
        req.flash('error', 'Location must be at least 2 characters');
        return res.redirect("/listings/new");
    }

    if (!country || country.trim().length < 2) {
        console.log("❌ Country validation failed:", country);
        req.flash('error', 'Country must be at least 2 characters');
        return res.redirect("/listings/new");
    }

    console.log("✅ All validation passed!"); // 👈 ADD THIS
    // Convert location into coordinates
        const fullLocation = `${location}, ${country}`;

        
    // Create listing...
   const newListing = new Listing({
    title: title.trim(),

    description: description.trim(),

    price: parseFloat(price),

    location: location.trim(),

    country: country.trim(),

    geometry: {
        type: "Point",
        coordinates: coordinates,
    },

    image: {
        url: image?.url || "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
        filename: "custom-image"
    }
});
    newListing.owner = req.user._id; // Associate listing with logged-in user
    newListing.image = {url, filename}; // Set image URL from uploaded file
    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect(`/listings/${newListing._id}`);
};



module.exports.renderEditListing = async (req, res) => {
    const { id } = req.params;
    const foundListing = await Listing.findById(id);
    if (!foundListing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }

    let originalImageUrl =  foundListing.image.url;
     originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit", { listing: foundListing, title: 'Edit Listing', originalImageUrl });
};


module.exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listingData = req.body.listing;

        // 1. Find the listing first to ensure it exists
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash('error', 'Listing not found!');
            return res.redirect('/listings');
        }

        // 2. Build our update payload using dot-notation for safety
        const updateFields = {
            title: listingData.title?.trim(),
            description: listingData.description?.trim(),
            price: parseFloat(listingData.price),
            location: listingData.location?.trim(),
            country: listingData.country?.trim(),
        };

        // 3. Check if a new file was uploaded via the edit form
        if (req.file) {
            // A new file was uploaded -> use its path and filename
            updateFields['image.url'] = req.file.path;
            updateFields['image.filename'] = req.file.filename;
        } else if (listingData.image && listingData.image.url) {
            // No new file, but text inputs for image URL were provided manually
            updateFields['image.url'] = listingData.image.url;
            updateFields['image.filename'] = listingData.image.filename || "custom-image";
        }

        // 4. Update the document with validation rules active
        const updatedListing = await Listing.findByIdAndUpdate(
            id, 
            { $set: updateFields }, 
            { new: true, runValidators: true }
        );

        req.flash('success', `Listing "${updatedListing.title}" updated successfully!`);
        res.redirect(`/listings/${updatedListing._id}`);

    } catch (err) {
        if (err.name === 'ValidationError') {
            req.flash('error', Object.values(err.errors).map(e => e.message).join(', '));
            res.redirect(`/listings/${req.params.id}/edit`);
        } else {
            console.error("Update Error:", err);
            req.flash('error', 'Error updating listing');
            res.redirect('/listings');
        }
    }
};



module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        req.flash('error', 'Listing not found!');
        return res.redirect('/listings');
    }
    req.flash('success', `Listing "${deletedListing.title}" deleted successfully!`);
    res.redirect("/listings");
};