const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const LeadsUpdatesSchema = new mongoose.Schema({
    communicationSource:{type:String},
    isDealComplete:{type:String,default:false},
    nextFollowUp:{type:Date},
    queryRemark:{type:String,default:"Buyer"},
    userId:{type:String},
    leadId:{type:String},
    lead: { type: Schema.Types.ObjectId, ref: 'Leads', required: true },
    updatedAt: { type: Date, default: Date.now }  
}, { timestamps: true })


const LeadsUpdates = mongoose.model("LeadUpdates", LeadsUpdatesSchema)
module.exports = LeadsUpdates