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
    alternateEmail: { 
        type: String,
        set: (email) => email.trim().toLowerCase(),
    },
    alternateNumber: { type: Number },
    website: { type: String },
    password: { type: String },
    mobileNumber: { type: Number },
    profilePic: {
        fileID: "",
        url: "",
        path: ""
    },
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
    moduleAccess: [],
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
    },
    isEmailEnable:[{
        role: {
            type:String,
            default:"admin"
        },
        isEnable: {
            type:Boolean,
            default:true
        }
    }],
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
    }],
    sources: [{
        name: {
            type: String
        },
        keyId: {
            type: String
        },
        haveState: {
            type: Boolean,
            default: false,
        },
        haveProduct: {
            type: Boolean,
            default: false,
        },
        isIntegrated: {
            type: Boolean,
            default: false
        },
        enableAutoAssign: {
            type: Boolean,
            default: false
        },
        autoAssignTo: [{
            empId: String,
            isActive: Boolean,
            states: Array,
            products: Array
        }],
        lastAssignTo: {
            type: String,
            default: ""
        }
    }]
}, { timestamps: true })


const NewUser = mongoose.model("User", NewUserSchema)
module.exports = NewUser