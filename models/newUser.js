const mongoose = require("mongoose")

const NewUserSchema = new mongoose.Schema({
    fullName: {type: String},
    parent_id: {type: String},
    indiaMartKey: { type: String },
    tradeIndaiKey: { type: String },
    email: { type: String },
    password: { type: String },
    mobileNumber: { type: Number },
    profilePic: { type: String },
    address: { type: String },
    IndiaMartCrmUrl: { type: String ,default:"" },
    otherUser:[],
    isActive:{type:Boolean,default:"false"},
    companyName: { type: String, unique: true },
    companyLogo:{type: String},
    isVerify:{type:Boolean ,default:false},
    verifyCode:{type:Number},
    userType: {
        type: String,
        lowercase: true,
       default: "user"
    },
    role: {
        type: String,
        lowercase: true,
        default: "user",
        enum:["company" ,"admin" ,"superadmin" ,"employee" ,"hr" ,"manager"]
    },
    moduleAccuss:[]

}, { timestamps: true })


const NewUser = mongoose.model("User", NewUserSchema)
module.exports = NewUser