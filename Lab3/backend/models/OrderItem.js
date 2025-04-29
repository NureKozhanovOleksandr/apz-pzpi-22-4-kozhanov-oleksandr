const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, required: true },
    price_per_item: { type: mongoose.Schema.Types.Decimal128, required: true },
}, { timestamps: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);
