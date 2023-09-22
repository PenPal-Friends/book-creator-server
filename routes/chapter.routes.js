const router = require("express").Router();
const mongoose = require("mongoose");

const Chapter = require("../models/Chapter.model");
// const Book = require("../models/Book.model");


//  POST /api/chapter - Creates a new chapter
router.post("/chapter", (req, res, next) => {
    const { chapterNumber, title, outline, text, bookId } = req.body;

    const newChapter = {
        chapterNumber,
        title,
        outline,
        text,
        // Setting the "book" field of the new chapter to 
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


// GET /books/:bookId/chapters/:chapterId - Show specific chapter.
router.get("/", )

// POST /books/:bookId/chapters - Add new chapter to specific book.

// PUT /books/:bookId/chapters/:chapterId - Update specific chapter.

// DELETE /books/:bookId/chapters/:chapterId - Delete specific chapter.


moduler.exports = router;


//  POST /api/tasks  -  Creates a new task
// router.post("/tasks", (req, res, next) => {
//     const { title, description, projectId } = req.body;

//     const newTask = { 
//         title, 
//         description, 
//         project: projectId 
//     }

//     Task.create(newTask)
//         .then(newTask => {
//             return Project.findByIdAndUpdate(projectId, { $push: { tasks: newTask._id } });
//         })
//         .then(response => res.json(response))
//         .catch(err => {
//             console.log("Error creating new task...", err);
//             res.status(500).json({
//                 message: "Error creating a new task",
//                 error: err
//             });
//         });
// });



// Position property (Chapter model):

// A) When new chapter is created, position shall be highest existing ch position of that book +1
// B1) When user moves card up:
// ---> position-1, but no less than 0
// ---> position of neighbor which has that same position we're moving into, +1
// B2) When user moves card down:
// ---> position+1, but no more than the amount of chapters for that book
// ---> position of neighbor which has that position we're moving into, -1
// C1) If position = 1, disable arrow up
// C2) If position = max length of chapters array, disable arrow down

// Create endpoint to move chapter up, like PUT /api/chapter/:chapterId/move-up
// Create endpoint to move chapter down, like PUT /api/chapter/:chapterId/move-down
// Logic: Find chapter with chapterId, find neighbor, swap positions, save both chapters