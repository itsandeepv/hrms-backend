const mongoose = require("mongoose")

const LeadResponseSchema = new mongoose.Schema({
    isPositive:{type:Boolean ,required:true},
    leadNesponseName:{type:String},
    userId:{type:String},
}, { timestamps: true })


const NewLeadResponse = mongoose.model("LeadResponse", LeadResponseSchema)
module.exports = NewLeadResponse