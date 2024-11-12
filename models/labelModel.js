
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LabelSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String},
  addedBy:{type:String},
});

const NewLabel = mongoose.model('Label', LabelSchema);
module.exports = NewLabel
