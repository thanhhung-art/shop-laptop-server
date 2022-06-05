const Review = require("../models/Review");
const router = require("express").Router();
const CryptoJS = require("crypto-js");
const {
  verifyTokenAdmin,
  verifyTokenAuthorization,
} = require("./verifyToken");

// create new review or update

router.post("/:id",verifyTokenAuthorization , async (req, res) => {
  try {
    const product = await Review.findOne({productId: req.body.productId});
    const userReq = {...req.body};
    const query = {productId: req.body.productId};

    if (product) {

      const userReviewed = product.reviews.find(e => e.userId === req.params.id);
      if (userReviewed) {
        const index = product.reviews.findIndex(e => e.userId === req.params.id);
        product.reviews[index] = userReq.review;

        const productUpdate = await Review.findOneAndUpdate(query, product);
        return res.status(200).json({message: "Review updated", success: true, productUpdate});
      }

      product.reviews.push(userReq.review);
      const productUpdate = await Review.findOneAndUpdate(query, product);
      return res.status(200).json({message: "User reviewed", success: true, productUpdate});
    }

    const review = new Review({...userReq, reviews: [userReq.review]});
    await review.save();
    res.status(201).json({ message: "Review created successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Something went wrong"});
  }
})

// get reviews

router.get("/:id", async (req, res) => {
  try {
    const product = await Review.findOne({productId: req.params.id});
    if (product) {
      return res.status(200).json({ reviews: product.reviews, });
    }
    return res.status(200).json({ reviews: [] });
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Something went wrong"});
  }
})

module.exports = router;