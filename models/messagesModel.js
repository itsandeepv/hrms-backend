const mongoose = require("mongoose")

const messagesSchema = new mongoose.Schema({
    hookResponse: {
        type: Object,
    }
},{
    timestamps:true
})


const WSMessage = mongoose.model("Message", messagesSchema)
module.exports = WSMessage;