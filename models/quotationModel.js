const mongoose = require("mongoose");

const quotationProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    }
})

const QuotationSchema = new mongoose.Schema({
    companyId: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        require: true,
    },
    leadId: {
        type: String,
    },
    subject: {
        type: String,
        required: true
    },
    products: [quotationProductSchema],
    quotationFile: {
        fileID: "",
        url: "",
        path:""
    },
    discount: {
        type: Number,
        default: 0,
    },
    tax: {
        value: {
            type: Number,
            default: 0,
        },
        isIncluded: {
            type: Boolean,
            default: false
        }
    },
    shippingCharge: {
        value: {
            type: Number,
            default: 0,
        },
        isIncluded: {
            type: Boolean,
            default: false
        }
    },
    additionalInfo: {
        type: String,
    },
    deliveryPeriod: {
        periodType: String,
        count: String,
    },
    totalAmount: {
        type: Number,
        default: 0,
        required: true
    },
    companyDetails: {
        name: String,
        email: String,
        address: String,
        contactNumber: String,
        referredBy: String,
        companyLogo:Object,
        GSTIN: String,
        bankDetails: Object,
        alternateEmail: String,
        alternateNumber: String,
        website: String,
    },
    clientDetails: {
        name: String,
        email: String,
        address: String,
        companyName: String,
        contactNumber: String,
        GSTIN: String
    },
    paymentTerms: {
        type: String,
    },
    quotationId: {
        type: String
    }
}, {timestamps: true})

const Quotation = mongoose.model("Quotation", QuotationSchema)
module.exports = Quotation;