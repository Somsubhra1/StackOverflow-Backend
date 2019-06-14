const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    // Anchoring 2 collections
    user: {
        type: Schema.Types.ObjectId, // id to anchor to the Person collection
        ref: "myPerson" // reference collection
    },
    username: {
        type: String,
        required: true,
        max: 50
    },
    website: {
        type: String
    },
    country: {
        type: String
    },
    languages: {
        type: [String], // Array of strings
        required: true
    },
    portfolio: {
        type: String
    },
    workrole: [
        // Array of objects
        {
            role: {
                type: String,
                required: true
            },
            company: {
                type: String
            },
            country: {
                type: String
            },
            from: {
                type: Date,
                // required: true
            },
            to: {
                type: Date,
                // required: true
            },
            current: {
                type: Boolean,
                default: false
            },
            details: {
                type: String
            }
        }
    ],
    social: {
        // social is an object
        youtube: {
            type: String
        },
        facebook: {
            type: String
        },
        instagram: {
            type: String
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Profile = mongoose.model("myProfile", ProfileSchema);
