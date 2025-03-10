const mongoose = require('mongoose');
const { type } = require('os');

const profileSchema = new mongoose.Schema({
    gender: {
        type: String
    },
    dateOfBirth: {
        type: String
    },
    about: {
        type: String,
        trim: true
    },
    contactNumber: {
        type: Number,
        trim: true
    },
    socialLinks: {
        facebookUrl:
        {
            type: String,
            trim: true
        },
        twitterUrl:
        {
            type: String, trim: true

        },
        instagramUrl:
        {
            type: String,
            trim: true
        },
        linkedinUrl: {
            type: String,
            trim: true
        }
    }



})

module.exports = mongoose.model("Profile", profileSchema);