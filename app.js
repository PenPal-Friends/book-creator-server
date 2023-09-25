// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// CORS middleware
const cors = require('cors');
// Which origin is allowed:
// app.use(cors({
//     origin: 'http://localhost:5173'
// }));

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);



const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

//Book Routes
const bookRoutes = require("./routes/book.routes");
app.use("/api", bookRoutes);

// //Chapter Routes
const chapterRoutes = require("./routes/chapter.routes");
app.use("/api", chapterRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
