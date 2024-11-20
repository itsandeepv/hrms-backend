const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique:true
  },
  price: {
    type: Number,
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: '',
  },
  description: {
    type: String,
  },
  image: {
    path: "",
    url:""
  },
  companyId: {
    type: String
  }
}, {timestamps: true});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
