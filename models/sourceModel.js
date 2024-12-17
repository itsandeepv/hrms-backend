const mongoose = require("mongoose")


const SourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    keyId: {
        type: String,
        default: "",
    },
    haveState: {
        type: Boolean,
        default: false,
    },
    haveProduct: {
        type: Boolean,
        default: false,
    }
}, {timestamps: true})

const Source = mongoose.model("Source", SourceSchema)
module.exports = Source