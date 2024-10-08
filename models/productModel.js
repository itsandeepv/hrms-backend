const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: '',
  }
}, {timestamps: true});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
