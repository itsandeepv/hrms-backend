const mongoose = require("mongoose")

const NotificationSchema = new mongoose.Schema({
    title:{type:String},
    status:{type:String},
    userId:{type:String},
    message:{type:String},
    time:{type:String},
}, { timestamps: true })


const NewNotification = mongoose.model("Notification", NotificationSchema)
module.exports = NewNotification