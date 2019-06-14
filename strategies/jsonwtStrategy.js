const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");

// Importing mongodb model
// const Person = require("../models/Person");
const Person = mongoose.model("myPerson");

// Importing key
const myKey = require("../setup/myurl");

// Configuring options for jwt token
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = myKey.secret;

// Exporting passport token
module.exports = passport => {
    passport.use(
        new JwtStrategy(opts, (jwt_payload, done) => {
            // Searching db by id
            Person.findById(jwt_payload.id)
                .then(person => {
                    // if found
                    if (person) {
                        return done(null, person);
                    }
                    // not found
                    return done(null, false);
                })
                // Error searching db
                .catch(err => console.log(err));
        })
    );
};
