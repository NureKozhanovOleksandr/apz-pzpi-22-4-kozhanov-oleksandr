const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    status: { type: String, required: true, enum: ['pending', 'completed', 'failed', 'refunded'] },
    payment_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
