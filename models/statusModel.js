
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatusSchema = new Schema({
  statusName: { 
    type: String, 
    required: true 
  },
  isPositive: { 
    type: Boolean, 
    default: false 
  },
  userId:{
    type: String
  },
  leadId:{
    type: Schema.Types.ObjectId
  },
  companyId: {
    type: String
  }
});

const NewStatus = mongoose.model('LeadsStatus', StatusSchema);
module.exports = NewStatus
