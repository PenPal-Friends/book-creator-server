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
            const maxPosition = Math.max(...chapters.map(chapter => chapter.position), 0);
            const newPosition = maxPosition + 1;

            const newChapter = {
                // Chapter number the same as new position
                chapterNumber: newPosition, 
                title,
                outline,
                text,
                book: bookId,
                position: newPosition
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
        .then(deletedChapter => {
            if (!deletedChapter) {
                return res.status(404).json({
                    message: "Chapter not found or doesnt belong to specific book.",
                });
            }
            res.json({ message: "Chapter successfully deleted. "});
        })
        .catch(err => {
            res.status(500).json({
                message: "Error deleting the chapter.",
                error: err
            });
        });
});


//
// Move Chapter cards //
//

// Move card up
router.put("/books/:bookId/chapters/:chapterId/move-up", (req, res, next) => {
    const { chapterId } = req.params;

    Chapter.findById(chapterId)
        .then(chapter => {
            if (!chapter) {
                return res.status(404).json({
                    message: "Chapter not found or doesnt belong to specific book.",
                });
            }

            // If chapter is already on top
            if (chapter.position === 1) {
                // Return statement prevents the function from executing further
                return res.status(400).json({
                    message: "Chapter is already on top.",
                });
            }

            // Find the chapter above the current one
            Chapter.findOne({ book: chapter.book, position: chapter.position - 1 })
                .then(aboveChapter => {
                    if (!aboveChapter) {
                        return res.status(404).json({
                            message: "No chapter found one position higher.",
                        });
                    }

                    // Position of current chapter -1 & position of the chapter above +1
                    chapter.position--;
                    aboveChapter.position++;

                    // Set chapter number to the updated position values
                    chapter.chapterNumber = chapter.position;
                    aboveChapter.chapterNumber = aboveChapter.position;

                    // Save both chapters
                    chapter.save()
                        .then(() => {
                            return aboveChapter.save();
                        })
                        .then(() => {
                            res.json({ message: "Chapter moved up successfully." });
                        });
                })
                .catch(error => {
                    res.status(500).json({ message: "Error finding the chapter above.", error: error });
                });
    })
    .catch (error => {
        res.status(500).json({ message: "Error finding the chapter.", error: error });
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
                    const positions = chapters.map(ch => ch.position);
                    const maxPosition = Math.max(...positions);

                    // If chapter is already at the bottom
                    if (chapter.position === maxPosition) {
                        // ... abort
                        return res.status(400).json({
                            message: "Chapter is already at the bottom.",
                        });
                    }

                    // Find the chapter below the current one
                    return Chapter.findOne({ book: chapter.book, position: chapter.position + 1 });
                })
                // Abort if not found
                .then(belowChapter => {
                    if (!belowChapter) {
                        return res.status(404).json({
                            message: "No chapter found one position lower.",
                        });
                    }

                    // Position of current chapter +1 & position of the chapter below -1
                    chapter.position++;
                    belowChapter.position--;

                    // Set chapter number to the updated position values
                    chapter.chapterNumber = chapter.position;
                    belowChapter.chapterNumber = belowChapter.position;

                    // Save both chapters
                    return chapter.save()
                        .then(() => belowChapter.save())
                        .then(() => {
                            res.json({ message: "Chapter moved down successfully." });
                        });
                })
                .catch(error => {
                    res.status(500).json({ message: "Error finding the chapter below.", error: error });
                });
        })
        .catch(error => {
            res.status(500).json({ message: "Error finding the chapter.", error: error });
        });
});



module.exports = router;



//
// Position cards
//
// Backend: see above
//
// Frontend:
// C1) If position = 1, disable arrow up
// C2) If position = max length of chapters array, disable arrow down
