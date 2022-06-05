const User = require("../models/User");
const router = require("express").Router();
const CryptoJS = require("crypto-js");
const { verifyTokenAdmin, verifyTokenAuthorization } = require("./verifyToken");

// update user

router.put("/:id", verifyTokenAuthorization, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
      }
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete user

router.delete("/:id", verifyTokenAuthorization, async (req, res) => {
  try {

    let success = true,
      error = "";

    const promies = req.body.map(async (userId) => await User.findByIdAndDelete(userId));

    await Promise.all(promies).catch((err) => {
      error = err;
      success = false;
      console.log(err)
    });

    if (success) {
      return res.status(200).json("User deleted");
    } 

    return res.status(500).json("something went wrong!");

  } catch (error) {
    res.status(500).json("something went wrong!");
  }
});

// get user by id

router.get("/find/:id", verifyTokenAuthorization, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update user password

router.post("/updatepass/:id", verifyTokenAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    const newPassword = CryptoJS.AES.encrypt(
      password,
      process.env.SECRET_KEY
    ).toString();
    await User.findByIdAndUpdate(req.params.id, {
      $set: { password: newPassword },
    });
    res.status(200).json("Password updated");
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all users

router.get("/", verifyTokenAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(1)
      : await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(error);
  }
});

// get user amount

router.get("/amount", verifyTokenAdmin, async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users.length);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
