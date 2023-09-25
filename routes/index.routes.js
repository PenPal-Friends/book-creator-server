const express = require("express");
const router = express.Router();
const fileUploader = require("../config/cloudinary.config");
 

router.get("/book", (req, res, next) => {
Book.find()
.then(booksFromDB => res.status(200).json(booksFromDB))
.catch(err => next(err));
});
router.post("/upload", fileUploader.single("imageUrl"), (req, res, next) => {
  // console.log("file is: ", req.file)
 
  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }

  res.json({ fileUrl: req.file.path });
});

module.exports = router;
