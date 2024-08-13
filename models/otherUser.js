const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    fullName: {type: String},
    adminId: {type: String},
    parent_id: {type: String},
    indiaMartKey: { type: String },
    tradeIndaiKey: { type: String },
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
    leadsAssign:[],
    isActive:{type:Boolean,default:false},
    role: {
        type: String,
        lowercase: true,
        default: "employee"
    },
    permissions:[]

}, { timestamps: true })


const OtherUser = mongoose.model("OtherUser", UserSchema)
module.exports = OtherUser