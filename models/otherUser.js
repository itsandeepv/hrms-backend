const mongoose = require("mongoose")

const NewUserSchema = new mongoose.Schema({
    fullName: {type: String},
    adminId: {type: String},
    email: { type: String },
    password: { type: String },
    mobileNumber: { type: Number },
    profilePic: { type: String },
    address: { type: String },
    companyName:{type: String},
    companyLogo:{type: String},
    userType: {
        type: String,
        lowercase: true,
       default: "sub-user"
    },
    role: {
        type: String,
        lowercase: true,
        default: "employee"
    },
    permissions:[]

}, { timestamps: true })


const NewUser = mongoose.model("User", NewUserSchema)
module.exports = NewUser