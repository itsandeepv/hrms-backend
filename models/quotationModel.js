const mongoose = require("mongoose")

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
        required: false,
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
    products: [quotationProductSchema],
    discount: {
        type: Number,
        default: 0,
    },
    tax: {
        type: Number,
        default: 0,
    },
    shippingCharge: {
        type: Number,
        default: 0,
    },
    additionalInfo: {
        type: String,
    },
    deliveryTime: {
        type: Object,
    },
    companyDetails: {
        name: String,
        address: String,
        contactNumber: String,
        referredBy: String,
    }
}, {timestamps: true})

const Quotation = mongoose.model("Quotation", QuotationSchema)
module.exports = Quotation;