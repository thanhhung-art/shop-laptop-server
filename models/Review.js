const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true},
  reviews: [{
    userId: String,
    review: String,
    rating: Number,
    name: String,
    replies: [{
      reply: String,
      name: String,
      userId: String,
    }]
  }],
})

module.exports = mongoose.model('Rating', reviewSchema);