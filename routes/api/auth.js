const express = require("express");
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");

// importing the key
const key = require("../../setup/myurl");

// Import schema for person to register
const Person = require("../../models/Person");

// Using express router
const router = express.Router();

// @type     - GET
// @route    - /api/auth
// @desc     - a route to API page
// @access   - PUBLIC
router.get("/", (req, res) => {
    res.json({ test: "Auth is being tested" });
});

// @type     - POST
// @route    - /api/auth/register
// @desc     - route for registration for users
// @access   - PUBLIC
router.post("/register", (req, res) => {
    // Finding from db
    Person.findOne({ email: req.body.email })
        // even if the collection is not found it enters then() part not catch() part
        .then(person => {
            if (person) {
                // user already present error
                return res
                    .status(400)
                    .json({ emailerror: "Email is already registered" });
            } else {
                // New user creation
                const newPerson = new Person({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    gender: req.body.gender
                });

                // Assigning female profile pic if the gender is female
                if (req.body.gender === "female") {
                    newPerson.profilepic =
                        "https://cdn.pixabay.com/photo/2014/04/03/10/32/user-310807_1280.png";
                }

                // Encrypting password using bcryptjs
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newPerson.password, salt, (err, hash) => {
                        // Handling error
                        if (err) {
                            throw err;
                        }
                        // Storing hashed password to the newPerson object
                        newPerson.password = hash;

                        // Storing to db
                        newPerson
                            .save()
                            .then(person => res.json(person))
                            // Error saving to db
                            .catch(err => console.log(err));
                    });
                });
            }
        })
        // Error finding user in db
        .catch(err => console.log(err));
});

// @type     - POST
// @route    - /api/auth/login
// @desc     - route for login for users
// @access   - PUBLIC
router.post("/login", (req, res) => {
    // const email = req.body.email;
    // const password = req.body.password;
    const { email, password } = req.body; // es6 destructuring

    // Finding person from db with email
    Person.findOne({ email })
        .then(person => {
            // If no person found
            if (!person) {
                return res
                    .status(404)
                    .json({ emailerror: "User not found with this email" });
            }
            // comparing hashed password from db with the user entered password
            bcrypt
                .compare(password, person.password)
                .then(isCorrect => {
                    if (isCorrect) {
                        // Password matched
                        // res.json({
                        //     success: "User is able to login successfully"
                        // });

                        // Use payload and create token
                        const payload = {
                            id: person.id,
                            name: person.name,
                            email: person.email,
                            gender: person.gender,
                            profilepic: person.profilepic
                        };
                        // Signing jwt token
                        jsonwt.sign(
                            payload,
                            key.secret,
                            { expiresIn: 3600 },
                            (err, token) => {
                                if (err) {
                                    // error signing token
                                    throw err;
                                } else {
                                    // success signing token
                                    res.json({
                                        success: true,
                                        token: "Bearer " + token
                                    });
                                }
                            }
                        );
                    } else {
                        // Password didn't match
                        res.status(400).json({
                            passworderror: "Password is not correct"
                        });
                    }
                })
                // Error comparing passwords
                .catch(err => console.log(err));
        })
        // Error finding person
        .catch(err => console.log(err));
});

// @type     - GET
// @route    - /api/auth/profile
// @desc     - route for user profile
// @access   - PRIVATE
router.get(
    "/profile",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // console.log(req);
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            gender: req.user.gender,
            profilepic: req.user.profilepic
        });
    }
);

// Exporting routes
module.exports = router;
