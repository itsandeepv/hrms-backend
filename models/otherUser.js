const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    fullName: {type: String},
    adminId: {type: String},
    parent_id: {type: String},
    indiaMartKey: { type: String },
    tradeIndaiKey: { type: String },
    email: { 
        type: String,
        set: (email) => email.trim().toLowerCase(),
    },
    password: { type: String },
    mobileNumber: { type: Number },
    companyId: { type: String },
    profilePic: {
        fileID: "",
        url: "",
        path: ""
    },
    address: { type: String },
    companyName:{type: String},
    companyLogo:{type: String},
    designation:{type: String},
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
    moduleAccess:[],
    leadFields: [{
        label: {
            type: String,
            set: (email) => email.trim(),
        },
        fieldType: {
            type: String,
            set: (email) => email.trim().toLowerCase(),
        },
        defaultValue: { type: [mongoose.Schema.Types.Mixed], default: [""] },
        // value: { type: [String, Boolean], default: "" }
    }]
}, { timestamps: true })


const OtherUser = mongoose.model("OtherUser", UserSchema)
module.exports = OtherUser