const router = require("express").Router();
const mongoose = require("mongoose");

const Chapter = require("../models/Chapter.model");
// const Book = require("../models/Book.model");


//  Create new chapter
router.post("/books/:bookId/chapters", (req, res, next) => {
    const { chapterNumber, title, outline, text } = req.body;
    const { bookId } = req.params;

    // Find chapters for given book
    Chapter.find({ book: bookId })
        .then(chapters => {
            // Determine max position for chapter
            const maxPosition = Math.max(...chapters.map(chapter => chapter.chapterNumber), 0);
            const newPosition = maxPosition + 1;

            const newChapter = {
                // Chapter number the same as new position
                chapterNumber: newPosition, 
                title,
                outline,
                text,
                book: bookId
            };

            // Create new chapter in database
            return Chapter.create(newChapter);
        })
        .then(response => res.json(response))
        .catch(err => {
            res.status(500).json({
                message: "Error creating a new chapter",
                error: err
            });
        });
});


// Show specific chapter
router.get("/books/:bookId/chapters/:chapterId", (req, res, next) => {
    const { chapterNumber, title, outline, text } = req.body;
    const { bookId, chapterId } = req.params;

    Chapter.findOne({ _id: chapterId, book: bookId })
        .then(chapter => {
            if (!chapter) {
                return res.status(404).json({
                    message: "Chapter not found.",
                });
            }
            res.json(chapter);
        })
        .catch(err => {
            res.status(500).json({
                message: "Error retrieving the new chapter",
                error: err
            });
        });
});


// Add new chapter to specific book
router.post("/books/:bookId/chapters", (req, res, next) => {
    const { chapterNumber, title, outline, text } = req.body;
    const { bookId } = req.params;

    const newChapter = {
        chapterNumber,
        title,
        outline,
        text,
        // Setting the "book" field of to the value from the params
        book: bookId
    }

    Chapter.create(newChapter)
        .then(response => res.json(response))
        .catch(err => {
            res.status(500).json({
                message: "Error creating a new chapter",
                error: err
            });
        });

});


// Update specific chapter
router.put("/books/:bookId/chapters/:chapterId", (req, res, next) => {
    const { chapterNumber, title, outline, text } = req.body;
    const { bookId, chapterId } = req.params;

    const updatedChapter = {
        chapterNumber,
        title,
        outline,
        text,
        // Setting the "book" field of to the value from the params
        book: bookId
    };

    Chapter.findOneAndUpdate({ _id: chapterId, book: bookId }, updatedChapter, { new: true })
        // Check chapterId correct?
        .then(updatedChapter => {
            if (!updatedChapter) {
                return res.status(404).json({
                    message: "Chapter not found or doesnt belong to specific book.",
                });
            }
            res.json(updatedChapter);
        })
        .catch(err => {
            res.status(500).json({
                message: "Error creating a new chapter",
                error: err
            });
        });

});


// Delete specific chapter
router.delete("/books/:bookId/chapters/:chapterId", (req, res, next) => {
    const { bookId, chapterId } = req.params;

    Chapter.findOneAndDelete({ _id: chapterId, book: bookId })
        .then(chapterToDelete => {
            if (!chapterToDelete) {
                return res.status(404).json({
                    message: "Chapter not found or doesnt belong to specific book.",
                });
            }

            // Update chapterNumber of chapters that haven't been deleted
            return Chapter.updateMany(
                // Selector: Right bookId & chapter no > than the one we delete
                {
                    book: bookId,
                    chapterNumber: { $gt: chapterToDelete.chapterNumber }
                },
                // Increment the chapterNumber by 1
                { $inc: { chapterNumber: -1 } }
            );
        })
        .then(() => {
            res.json({ message: "Chapter successfully deleted and others updated." });
        })
        .catch(err => {
            res.status(500).json({ message: "Error deleting the chapter.", error: err });
        });
});


// Get list of chapters
router.get("/books/:bookId/chapters/", (req, res, next) => {
    const { bookId } = req.params;

    Chapter.find({ book: bookId })
        .then(chapters => {
            res.json(chapters);
        })
        .catch(error => {
            res.status(500).json({
                message: "Error retrieving chapters for the book",
                error: error
            });
        });
});


//
// Move Chapter cards //
//

// Move card up
router.put("/books/:bookId/chapters/:chapterId/move-up", (req, res, next) => {
    const { chapterId } = req.params;
    let aboveChapter;

    Chapter.findById(chapterId)
        .then(chapter => {
            console.log("Current Chapter:", chapter);
            if (!chapter) {
                return res.status(404).json({
                    message: "Chapter not found or doesnt belong to specific book.",
                });
            }

            // If chapter is already on top
            if (chapter.chapterNumber === 1) {
                // Return statement prevents the function from executing further
                return res.status(400).json({
                    message: "Chapter is already on top.",
                });
            }
            
            // Find the chapter above the current one
            return Chapter.findOne({ book: chapter.book, chapterNumber: chapter.chapterNumber - 1 });
        })
        .then(chapterAbove => {
            aboveChapter = chapterAbove;
            if (!aboveChapter) {
                return res.status(404).json({
                    message: "No chapter found one position higher.",
                });
            }
            // Temporarily displace aboveChapter
            aboveChapter.chapterNumber = -1;
            return aboveChapter.save();
        })
        // Find current chapter in the database
        .then(() => {
            return Chapter.findById(chapterId);
        })
        // Decrement chapterNumber of current chapter
        .then(freshChapter => {
            freshChapter.chapterNumber--;
            return freshChapter.save();
        })
        .then(updatedChapter => {
            aboveChapter.chapterNumber = updatedChapter.chapterNumber + 1;
            return aboveChapter.save();
        })
        .then(() => {
            // Feedback
            res.json({ message: "Chapter moved up successfully." });
        })
        .catch (error => {
            res.status(500).json({ message: "Error moving the chapter.", error: error });
        });
});


// Move card down
router.put("/books/:bookId/chapters/:chapterId/move-down", (req, res, next) => {
    const { chapterId } = req.params;

    Chapter.findById(chapterId)
        .then(chapter => {
            if (!chapter) {
                return res.status(404).json({
                    message: "Chapter not found or doesnt belong to specific book.",
                });
            }

            // Find the max position for the chapters
            Chapter.find({ book: chapter.book })
                .then(chapters => {
                    const chapterNumbers = chapters.map(ch => ch.chapterNumber);
                    const maxChapterNumber = Math.max(...chapterNumbers);

                    // If chapter is already at the bottom
                    if (chapter.chapterNumber === maxChapterNumber) {
                        // ... abort
                        throw new Error("Chapter is already at the bottom.");
                    }

                    // Find the chapter below the current one
                    return Chapter.findOne({ book: chapter.book, chapterNumber: chapter.chapterNumber + 1 });
                })
                // Abort if not found
                .then(belowChapter => {
                    if (!belowChapter) {
                        return res.status(404).json({
                            message: "No chapter found one position lower."
                        });
                    }

                    // Temporarily displace belowChapter
                    belowChapter.chapterNumber = -1;
                    return belowChapter.save();
                })
                .then(() => {
                    // Position of current chapter +1
                    chapter.chapterNumber++;
                    return chapter.save();
                })
                .then(() => {
                    return Chapter.findOneAndUpdate({ book: chapter.book, chapterNumber: -1 }, { chapterNumber: chapter.chapterNumber - 1 }, { new: true });
                })
                .then(() => {
                    res.json({ message: "Chapter moved down successfully." });
                })
                .catch(error => {
                    res.status(500).json({ message: "Error moving chapter down.", error: error });
                });
        })
        .catch(error => {
            res.status(500).json({ message: "Error finding the chapter", error: error });
        });
});


module.exports = router;