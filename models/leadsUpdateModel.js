const mongoose = require("mongoose")

const LeadsUpdatesSchema = new mongoose.Schema({
    communicationSource:{type:String},
    isDealComplete:{type:String,default:false},
    nextFollowUp:{type:Date},//subject ==subject
    queryRemark:{type:String,default:"Buyer"},
    userId:{type:String},
    leadId:{type:String},
   
}, { timestamps: true })


const LeadsUpdates = mongoose.model("LeadUpdates", LeadsUpdatesSchema)
module.exports = LeadsUpdates