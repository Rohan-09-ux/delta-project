const express = require("express");
const router = express.Router();

//post
//index
router.get("/",(req,res) => {
    res.send("hi i am a posts");
});

//show
router.get("/:id",(req,res) => {
    res.send("Get for posts id");
});
//post
router.post("/",(req,res) => {
    res.send("Post for posts");
});

//delete
router.delete("/:id",(req,res) => {
    res.send("Delete for posts id");
});

module.exports = router;                    