const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");

// Importing all routes
const auth = require("./routes/api/auth");
const questions = require("./routes/api/questions");
const profile = require("./routes/api/profile");

// Express Init
const app = express();

// Middlewares for body-parser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// MongoDB configuration import
const db = require("./setup/myurl").mongoURL;

// Passport middleware
app.use(passport.initialize());

// Config for JWT strategy
require("./strategies/jsonwtStrategy")(passport);

// Attempt to connect db
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.log(err));

// Testing
// app.get("/", (req, res) => {  // Testing
//     res.send("<h1>Hello</h1>");
// });

// Actual routes
app.use("/api/auth", auth);
app.use("/api/questions", questions);
app.use("/api/profile", profile);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
