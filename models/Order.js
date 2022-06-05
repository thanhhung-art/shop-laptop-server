const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    phone: String,
    username: String,
    products: [{
        productId: String,
        quantity: {type: Number, default: 1},
        name: String,
        img: String,
    }],
    amount: Number,
    address: String,
    status: {type: String, default: 'pending'},
    payment: String,
    note: String,
},{timestamps: true});

module.exports = mongoose.model('Order', OrderSchema);