const Cart = require("../models/Cart");
const router = require("express").Router();
const CryptoJS = require("crypto-js");
const {
  verifyTokenAdmin,
  verifyTokenAuthorization,
} = require("./verifyToken");

// create new cart

router.post("/", verifyTokenAdmin, async (req, res) => {
    try {
        const cart = new Cart({
        ...req.body,
        });
        await cart.save();
        res.status(201).json(cart);
    } catch (error) {
        res.status(500).json(error);
    }
})

// update cart

router.put("/:id", verifyTokenAdmin, async (req, res) => {
    try {
        const cart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json(error);
    }
})

// delete cart

router.delete("/:id", verifyTokenAdmin, async (req, res) => {
    try {
        const cart = await Cart.findByIdAndDelete(req.params.id);
        res.status(200).json("cart deleted");
    } catch (error) {
        res.status(500).json(error);
    }
})

// get user cart

router.get("/find/:id", verifyTokenAuthorization, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.id });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json(error);
    }
})

// get all 

router.get("/", verifyTokenAdmin, async (req, res) => {
    try {
        const cart = await Cart.find();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json(error);
    }
})

module.exports = router;