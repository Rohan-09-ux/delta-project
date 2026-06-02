const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");

const listingController = require("../controller/listings.js");
const multer  = require('multer');
const{storage}=require("../cloudConfig.js");
const upload = multer({storage });


const validateReview = (req, res, next) => {
   let { error } = reviewSchema.validate(req.body);
   if (error) {
       let errMsg = error.details.map(el => el.message).join(', ');
       throw new ExpressError(errMsg, 400);
   } else {
       next();
   }
};  


router.route("/")
.get( wrapAsync(listingController.index))
.post(isLoggedIn,
    upload.single('listing[image][url]'),
    wrapAsync(listingController.createListing)
);


// NEW ROUTE
router.get("/new",isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")
    .get( wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single('listing[image][url]'),
         wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing));



// EDIT ROUTE
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditListing));

module.exports = router;


// Add this route to handle the main homepage link
const app = express();
app.get('/', (req, res) => {
    res.redirect('/listings');
});