const mongoose = require("mongoose")

const NewUserSchema = new mongoose.Schema({
    fullName: {
        type: String
    },
    indiaMartKey: { type: String },
    tradeIndaiKey: { type: String },
    email: { type: String },
    password: { type: String },
    mobileNumber: { type: Number },
    profilePic: { type: String },
    address: { type: String },
    userType: {
        type: String,
        lowercase: true,
       default: "user"
    },
    role: {
        type: String,
        lowercase: true,
        default: "user"
    }

}, { timestamps: true })


const NewUser = mongoose.model("User", NewUserSchema)
module.exports = NewUser