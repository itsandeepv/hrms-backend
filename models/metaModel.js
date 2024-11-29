const mongoose = require("mongoose")


const MetaSchema = new mongoose.Schema({
    data: {
        type: String
    },
    query: {
        type: String
    }
}, {timestamps: true})

const Meta = mongoose.model("Meta", MetaSchema)
module.exports = Meta