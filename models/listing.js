const mongoose = require('mongoose');
const Review = require('./review');
const { ref } = require('joi');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        minlength: [3, "Title must be at least 3 characters"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minlength: [10, "Description must be at least 10 characters"]
    },
    image: {
       url: String,
      filename: String,

    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [1, "Price must be greater than 0"],
        max: [1000000, "Price too high"]
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        minlength: [2, "Location must be at least 2 characters"]
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        minlength: [2, "Country must be at least 2 characters"]
    },
     reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
          type: mongoose.Schema.Types.ObjectId,
           ref: "User"
    },
            geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },

            coordinates: {
                type: [Number],
                required: true,
            },
        },

});

listingSchema.post('findOneAndDelete', async (listing) =>{
    if(listing) {
        await Review.deleteMany({_id : {$in: listing.reviews}});

    }
    

});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;