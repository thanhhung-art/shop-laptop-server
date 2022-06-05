const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    desc: String,
    img: String,
    categories: String,
    ram: String,
    rom: String,
    cpu: String,
    gpu: String,
    screen: String,
    camera: String,
    battery: String,
    os: String,
    brand: String,
    color: String,
    instock: Boolean,
    rating: Number,
    reviews: [
      {
        name: String,
        userId: String,
        rating: Number,
        review: String,
        userImg: String,
        reply: [{
          name: String,
          userId: String,
          userImg: String,
          content: String,
          isAdmin: Boolean,
        }]
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
