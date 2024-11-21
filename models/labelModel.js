
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  color: { 
    type: String,
    default: "#1f8104",
    require: true,
  },
  addedBy:{
    type:String
  },
  companyId: {
    type: String
  }
},{
  timestamps:true
});

const NewLabel = mongoose.model('Label', LabelSchema);
module.exports = NewLabel
