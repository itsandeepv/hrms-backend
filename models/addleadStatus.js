
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeadStatus = new Schema({
  leadType: { type: String, required: true },
  leadStatusName: { type: String,unique: false},
  userId:{type:Schema.Types.ObjectId ,ref:"User"}
}, { timestamps: true });

const NewLeadStatus = mongoose.model('LeadStatus', LeadStatus);
module.exports = NewLeadStatus
