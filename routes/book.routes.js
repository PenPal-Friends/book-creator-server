const router = require("express").Router();
const mongoose = require("mongoose");
const Chapter = require("../models/Chapter.model");
const Book = require("../models/Book.Model");
// const Chapter = require ("../models/Chapter.model");
 const fileUploader = require('../config/cloudinary.config');
const {isAuthenticated } = require("../middleware/jwt.middleware");

//  POST /api/book  -  Creates a new book
router.post("/books",isAuthenticated, (req, res, next) => {
    const { title, subtitle, description, imageUrl } = req.body;
    const userId = req.payload._id;

    const newBook = {
        title,
        subtitle,
        description,
        imageUrl,
        user : userId,
    }

    Book.create(newBook)
        .then(response => res.json(response))
        .catch(err => {
            console.log("Error creating new book...", err);
            res.status(500).json({
                message: "Error creating a new book",
                error: err
            });
        });
});

// PUT  /api/book/:bookId  -  Updates a specific book by id
//later include isAuthenticated added now


router.put('/books/:bookId',  (req, res, next) => {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }
    const newDetails = {
        title: req.body.title,
        subtitle:req.body.subtitle,
        description: req.body.description,
        imageUrl: req.body.imageUrl
    }

    Book.findByIdAndUpdate(bookId, newDetails, { new: true })
        .then((updatedBook) => res.json(updatedBook))
        .catch(err => {
            console.log("Error updating Book", err);
            res.status(500).json({
                message: "Error updating book",
                error: err
            });
        })
});
router.get('/books', isAuthenticated, (req, res, next) => {
    // Fetch books only for the authenticated user
    const userId = req.payload._id;
  
    Book.find({ user: userId })
        .then(allBooks => {
            res.json(allBooks);
        })
        .catch(err => {
            console.log("Error getting the Books...", err);
            res.status(500).json({
                message: "Error getting the Books",
                error: err
            });
        });
});

module.exports = router;