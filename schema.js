const Jio = require("joi");
module.exports.reviewSchema = Jio.object({
    review: Jio.object({
        rating: Jio.number().required(),
        comment: Jio.string().required(),
    }).required(),
});