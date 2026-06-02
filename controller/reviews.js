const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    console.log(newReview);
    newReview.author = req.user._id;

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash('success', 'Review added successfully!');

    // console.log("New review saved");
    // res.send("new review saved");

    res.redirect(`/listings/${listing._id}`);


};

module.exports.deleteReviews = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id,{ $pull: { reviews: { _id: reviewId } } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');

    res.redirect(`/listings/${id}`);
};