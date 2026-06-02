const express = require("express");
const router = express.Router({mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isreviewAuthor } = require("../middleware.js");

const reviewController  = require("../controller/reviews.js")



const validateReview = (req, res, next) => {
   let { error } = reviewSchema.validate(req.body);
   if (error) {
       let errMsg = error.details.map(el => el.message).join(', ');
       throw new ExpressError(errMsg, 400);
   } else {
       next();
   }
};

//reviews
//post route
router.post("/", 
    isLoggedIn,  validateReview, wrapAsync(reviewController.createReview));


//delete Review route
router.delete("/:reviewId",isLoggedIn,isreviewAuthor, wrapAsync(reviewController.deleteReviews));


module.exports = router;