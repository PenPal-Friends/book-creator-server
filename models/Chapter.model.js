
const { Schema, model } = require("mongoose");
const { createIndexes } = require("./User.model");

const chapterSchema = new Schema(
    {
        // Visible content

        // chapterNumber serves as both visible number aswell as the position
        chapterNumber: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            maxlength: 20,
        },
        outline: {
            type: String,
            maxlength: 400,
        },
        text: {
            type: String,
            maxlength: 1000000,
        },

        // Reference to Book model
        book: {
            type: Schema.Types.ObjectId,
            ref: 'Book',
            required: true,
        },
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
    }
);

// Mongoose method to make sure no two docs in collection will have the same combination of "book" and "chapterNumber"
// Each chapter within a book will have a unique chapter number.
chapterSchema.index({ book: 1, chapterNumber: 1 }, { unique: true });



const Chapter = model("Chapter", chapterSchema);

module.exports = Chapter;


