const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

// Importing models:
const Person = require("../../models/Person");
const Profile = require("../../models/Profile");
const Question = require("../../models/Question");

const router = express.Router();

// @type     - GET
// @route    - /api/questions
// @desc     - route for showing all questions
// @access   - PUBLIC
router.get("/", (req, res) => {
    Question.find()
        // Sorting based on date
        .sort({ date: "desc" })
        // Success fetching questions
        .then(questions => res.json(questions))
        // Error fetching questions
        .catch(err => console.log("Error fetching questions: " + err));
});

// @type     - POST
// @route    - /api/questions/
// @desc     - route for submitting questions
// @access   - PRIVATE
router.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // Creating new question
        const newQuestion = new Question({
            textone: req.body.textone,
            texttwo: req.body.texttwo,
            user: req.user.id,
            name: req.body.name
        });

        // Saving new question to db
        newQuestion
            .save()
            // Success saving
            .then(question => res.json(question))
            // Error saving
            .catch(err => console.log("Unable to push question to db: " + err));
    }
);

// @type     - POST
// @route    - /api/questions/answers/:id
// @desc     - route for submitting answers to questions
// @access   - PRIVATE
router.post(
    "/answers/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // Finding question by id
        Question.findById(req.params.id)
            .then(question => {
                // Creating new answer
                const newAnswer = {
                    user: req.user.id,
                    name: req.body.name,
                    text: req.body.text
                };
                question.answers.push(newAnswer);

                // Saving new answer to db
                question
                    .save()
                    // Success saving
                    .then(question => res.json(question))
                    // Error saving
                    .catch(err => console.log("Error saving answer: " + err));
            })
            // Error finding question
            .catch(err => console.log(err));
    }
);

// @type     - POST
// @route    - /api/questions/upvote/:id
// @desc     - route for upvoting answers
// @access   - PRIVATE
router.post(
    "/upvote/:id",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            // Finding by user id
            .then(profile => {
                Question.findById(req.params.id)
                    .then(question => {
                        // Find the question by id
                        // if (question.upvotes.filter(upvote => upvote.user.toString() === req.user.id.toString()).length > 0) {
                        // If already upvoted, remove upvote
                        if (question.upvotes.some(upvote => upvote.user.toString() === req.user.id.toString())) {
                        
                            // return res.status(400).json({ noupvote: "User already upvoted" });

                            // Removing upvote
                            const remove = question.upvotes.map(upvote => upvote.user).indexOf(req.user.id.toString());
                            question.upvotes.splice(remove, 1);
                            
                            // Saving to db
                            question.save()
                                .then(question => res.json(question))
                                .catch(err => console.log(err));
                            return;
                        }
                        // Save upvote
                        question.upvotes.push({ user: req.user.id });
                        question.save()
                            .then(question => res.json(question))
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }
);

// @type     - DELETE
// @route    - /api/questions/delete/:id
// @desc     - route for deleting questions
// @access   - PRIVATE
router.delete("/delete/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Question.findOne({ _id: req.params.id })
        // finding by id
        .then(question => {
            // if user id matches
            if (question.user.toString() === req.user.id.toString()) {
                // removing
                question.remove()
                    .then(() => res.json({ questionremoved: "Question successfully removed" }))
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log("No such question: " + err));
});

// @type     - DELETE
// @route    - /api/questions/deleteall
// @desc     - route for deleting all questions
// @access   - PRIVATE
router.delete("/deleteall", passport.authenticate("jwt", { session: false }), (req, res) => {
    // Finding all questions by user id
    Question.find({ user: req.user.id })
        .remove()
        // success removing
        .then(() => res.json({ questionremoved: "All questions removed successfully" }))
        // error removing
        .catch(err => console.log("No such question: " + err));
});

// separate route for linux questions

// Testing
// router.get("/", (req, res) => {
//     res.json({ questions: "From questions" });
// });

module.exports = router;
