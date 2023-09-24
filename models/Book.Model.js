const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const bookSchema = new Schema(
  {
    title: String,
    subtitle: String,
    // genre : ["Fiction","Business", "History"],
    description: String,
    image: String,

    //ref. to the user model
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = model("Book", bookSchema);
