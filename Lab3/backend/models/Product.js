const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    brand: { type: String },
    size: { type: String },
    type: { type: String },
    price: { type: mongoose.Schema.Types.Decimal128, required: true },
    quantity: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
