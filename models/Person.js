const mongoose = require("mongoose");

// Creating schema
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
    name: {
        type: String,
        required: true // by default the required is false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    profilepic: {
        type: String,
        default:
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    date: {
        type: Date,
        default: Date.now // default value
    },
    gender: {
        type: String,
        required: true,
        default: "male"
    }
});

module.exports = Person = mongoose.model("myPerson", PersonSchema); // exporting mongodb model
