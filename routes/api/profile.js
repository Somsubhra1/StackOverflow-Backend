const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

// Importing db models
const Person = require("../../models/Person");
const Profile = require("../../models/Profile");

// Initializing router
const router = express.Router();

// @type     - GET
// @route    - /api/profile
// @desc     - route for personal user profile
// @access   - PRIVATE
router.get(
    "/",
    passport.authenticate("jwt", { session: false }), // for private route we need to authenticate through jwt token
    (req, res) => {
        Profile.findOne({ user: req.user.id }) // id is the only anchor point
            .then(profile => {
                if (!profile) {
                    // If no profile found
                    return res
                        .status(404)
                        .json({ profilenotfound: "No profile found" });
                }
                return res.json(profile); // Profile found
            })
            // Error querying to profile collection
            .catch(err => console.log("Got some error in profile: " + err));
    }
);

// @type     - POST
// @route    - /api/profile
// @desc     - route for updating and saving user profile
// @access   - PRIVATE
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // setting values for updating
        const profileValues = { social: {} }; // inside a social object needs to be created since it's nested object
        profileValues.user = req.user.id; // setting id for anchoring

        // checking and assigning values
        if (req.body.username) profileValues.username = req.body.username;
        if (req.body.website) profileValues.website = req.body.website;
        if (req.body.country) profileValues.country = req.body.country;
        if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;
        if (typeof req.body.languages !== undefined) {
            profileValues.languages = req.body.languages.split(","); // Splitting values in array
        }
        if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
        if (req.body.facebook)
            profileValues.social.facebook = req.body.facebook;
        if (req.body.instagram)
            profileValues.social.instagram = req.body.instagram;

        // Database stuff:
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                if (profile) {
                    // Profile already present so update profile
                    Profile.findOneAndUpdate(
                        { user: req.user.id }, // reference to find
                        { $set: profileValues }, // values to update with
                        { new: true } // new is given to return the modified document, if false it will return the original document
                    )
                        // Successful update
                        .then(profile => res.json(profile))
                        // Error in updating
                        .catch(err => console.log("Problem in update " + err));
                } else {
                    // Checking if username already exists or not
                    Profile.findOne({ username: profileValues.username })
                        .then(profile => {
                            if (profile) {
                                // username already present
                                res.status(400).json({
                                    username: "username already exists"
                                });
                            } else {
                                // Save user
                                new Profile(profileValues) // short hand syntax to call Profile schema
                                    .save()
                                    // successfully saved
                                    .then(profile => res.json(profile))
                                    .catch(err =>
                                        // error saving
                                        console.log(
                                            "Error saving new profile " + err
                                        )
                                    );
                            }
                        })
                        .catch(err =>
                            // error finding username
                            console.log(
                                "Problem in finding user with that username " +
                                    err
                            )
                        );
                }
            })
            .catch(err => console.log("Problem in fetching profile " + err));
    }
);

// @type     - GET
// @route    - /api/profile/:username
// @desc     - route for getting user profile based on username
// @access   - PUBLIC
router.get("/:username", (req, res) => {
    // Searching based on username
    Profile.findOne({ username: req.params.username })
        .populate("user", ["name", "profilepic", "gender"]) // populate is used to merge queries data from 2 colletions, 1st param is the Profile collection's reference value, and send param is an array of values we want to fetch from the Person collection
        .then(profile => {
            if (!profile) {
                // No profile found
                return res.status(404).json({ usernotfound: "User not found" });
            }
            // Found profile
            res.json(profile);
        })
        // error searching profile
        .catch(err => console.log("Error in fetching username " + err));
});

// @type     - GET
// @route    - /api/profile/id/:id
// @desc     - route for getting user profile based on id
// @access   - PUBLIC
router.get("/id/:id", (req, res) => {
    // Searching based on id
    Profile.findOne({ user: req.params.id })
        .populate("user", ["name", "profilepic", "gender"])
        .then(profile => {
            if (!profile) {
                // No profile found
                return res.status(404).json({ usernotfound: "User not found" });
            }
            // Found profile
            res.json(profile);
        })
        // error searching profile
        .catch(err => console.log("Error searching profile by id" + err));
});

// @type     - GET
// @route    - /api/profile/find/everyone
// @desc     - route for getting user profile of everyone
// @access   - PUBLIC
router.get("/find/everyone", (req, res) => {
    // Searching based on username
    Profile.find()
        .populate("user", ["name", "profilepic", "gender"]) // populate is used to merge queries data from 2 colletions, 1st param is the Profile collection's reference value, and send param is an array of values we want to fetch from the Person collection
        .then(profiles => {
            if (!profiles) {
                // No profile found
                return res.status(404).json({ usernotfound: "User not found" });
            }
            // Found profile
            res.json(profiles);
        })
        // error searching profile
        .catch(err => console.log("Error in fetching username " + err));
});

// @type     - DELETE
// @route    - /api/profile/
// @desc     - route for getting user based on id
// @access   - PRIVATE
router.delete(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // Finding user profile based on id
        Profile.findOne({ user: req.user.id }); // this may include confirmation from user whether to delete or not
        // Finding and removing user profile based on id
        Profile.findOneAndRemove({ user: req.user.id })
            .then(() => {
                // Found profile in profile collection and removed
                Person.findOneAndRemove({ _id: req.user.id }) // checking by autogenerated id
                    .then(() => res.json({ success: "Delete was a success" })) // Found the person in person collection and removed

                    // Error finding Person
                    .catch(err => console.log(err));
            })
            // Error finding profile
            .catch(err => console.log(err));
    }
);

// @type     - POST
// @route    - /api/profile/workrole
// @desc     - route for adding work profile of a person
// @access   - PRIVATE
router.post(
    "/workrole",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            // Finding user by id
            .then(profile => {
                if (!profile) {
                    // Profile  not found
                    return res
                        .status(404)
                        .json({ profilenotfound: "Error profile not found" });
                }
                // Creating new workrole
                const newWork = {
                    role: req.body.role,
                    company: req.body.company,
                    country: req.body.country,
                    from: req.body.from,
                    to: req.body.to,
                    current: req.body.current,
                    details: req.body.details
                };

                // Adding to workrole array
                profile.workrole.push(newWork);

                // Saving to db
                profile
                    .save()
                    // Success save
                    .then(profile => res.json(profile))
                    // Error saving
                    .catch(err => console.log(err));
            })
            // Error find user
            .catch(err => console.log(err));
    }
);

// @type     - DELETE
// @route    - /api/profile/workrole/:w_id
// @desc     - route for deleting a specific work role based on id
// @access   - PRIVATE
router.delete(
    "/workrole/:w_id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // Finding user based on id
        Profile.findOne({ user: req.user.id })
            .then(profile => {
                if (!profile) {
                    // No profile found
                    return res
                        .status(404)
                        .json({ profilenotfound: "Error Profile not found" });
                }
                // Removing workrole from profile.workrole array
                const remove = profile.workrole
                    .map(item => item.id)
                    .indexOf(req.params.w_id);

                profile.workrole.splice(remove, 1);

                // Saving the updated profile.workrole array to db
                profile
                    .save()
                    .then(profile => res.json(profile))
                    .catch(err => console.log(err));
            })
            // Error finding profile
            .catch(err => console.log(err));
    }
);

// Testing
// router.get("/", (req, res) => {
//     res.json({ profile: "from profile" });
// });

module.exports = router;
