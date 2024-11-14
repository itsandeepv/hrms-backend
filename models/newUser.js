const mongoose = require("mongoose")

const NewUserSchema = new mongoose.Schema({
    fullName: { type: String },
    parent_id: { type: String },
    indiaMartKey: { type: String },
    tradeIndaiKey: { type: String },
    email: { 
        type: String,
        set: (email) => email.trim().toLowerCase(),
    },
    password: { type: String },
    mobileNumber: { type: Number },
    profilePic: { type: String },
    address: { type: String },
    IndiaMartCrmUrl: { type: String, default: "https://crmhai.com/api/indiamart" },
    otherUser: [],
    selectedEmployee: { type: Array },
    isActive: { type: Boolean, default: "false" },
    autoAssigning: { type: Boolean, default: "false" },
    companyName: { type: String, unique: true },
    companyLogo: {
        fileID: "",
        url: "",
        path: ""
    },
    isVerify: { type: Boolean, default: false },
    verifyCode: { type: Number },
    userType: {
        type: String,
        lowercase: true,
        default: "user"
    },
    role: {
        type: String,
        lowercase: true,
        default: "user",
        enum: ["company", "admin", "superadmin", "employee", "hr", "manager"]
    },
    moduleAccuss: [],
    GSTIN: {
        type: String
    },
    bankDetails: {
        name: String,
        accountNumber: String,
        ifscCode: String,
        branch: String,
        bankName: String
    },
    totalQuotation: {
        type: Number,
        default: 0
    },
    totalInvoice: {
        type: Number,
        default: 0
    }

}, { timestamps: true })


const NewUser = mongoose.model("User", NewUserSchema)
module.exports = NewUser