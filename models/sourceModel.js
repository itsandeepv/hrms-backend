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
    }
}, {timestamps: true})

const Source = mongoose.model("Source", SourceSchema)
module.exports = Source