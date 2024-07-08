const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for orders
const OrderSchema = new Schema({
    reford: { type: String, required: false },
    customer_id: { type: String, ref: 'Contact', required: true }, // Reference to Customer model
    phone: { type: String, required: true }, 
    email: { type: String, required: true }, 
    order_date: { type: Date, default: Date.now }, // Default to current date
    status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    total_amount: { type: Number, required: true },
    shipping_address: { type: String, required: true }, 
    paymentMethod: { type: String, required: true },
    products: [],
    created_at: { type: Date},
    updated_at: { type: Date}
});

// Add a pre-save hook to update the updated_at field
OrderSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Create and export the Order model
const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
