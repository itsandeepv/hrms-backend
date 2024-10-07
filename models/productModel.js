
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    qunatity: { type: String },
    description: { type: String, required: true },
    productName: { type: String, required: true },
    pricePerUnit: { type: String },
    discount: { type: String },
    unitType: { type: String },
    isPositive: { type: String },
    userId: { type: String },
    leadId: { type: Schema.Types.ObjectId },
});

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product
