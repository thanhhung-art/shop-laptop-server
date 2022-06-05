const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// register

router.post("/register", async (req, res) => {
  try {
    const checkUser = await User.findOne({ email: req.body.email });
    if (checkUser) {
      return res.status(400).json("User already exists");
    }
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SECREC
      ).toString(),
    });
    const savedUser = await user.save();

    const token = jwt.sign(
      { _id: savedUser._id, isadmin: savedUser.isadmin },
      process.env.JWT_SECREC,
      { expiresIn: "3d" }
    );
    res.cookie("authtoken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    });
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

// login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json("Email not found");
    }
    const decryptPass = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SECREC
    ).toString(CryptoJS.enc.Utf8);
    if (decryptPass !== req.body.password) {
      return res.status(400).json("Invalid password");
    }
    const token = jwt.sign(
      { _id: user._id, isadmin: user.isadmin },
      process.env.JWT_SECREC,
      { expiresIn: "3d" }
    );

    if (user.isadmin) {
      res.cookie("authtokenadmin", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      });
      return res.status(200).json({success: true, user});
    }

    res.cookie("authtokenuser", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    });
    return res.status(200).json({ success: true, user});
  } catch (error) {
    return res.status(400).json({ message: "something went wrong", success: false });
  }
});

// logout

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.authtokenadmin || req.cookies.authtokenuser;
    res.clearCookie("authtokenadmin");
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ message: "something went wrong", success: false });
  }
})

// check authencation

router.get("/check/admin", async(req, res) => {
  const token = req.cookies.authtokenadmin;
  try {
    if (token) {
      return res.status(200).json({success: true});
    }
    return res.status(401).json({ success: false});
  } catch(err) {
    res.status(400).json({ success: false });
  }
})

router.get("/check/user", async (req, res) => {
  const token = req.cookies.authtokenuser;
  try {
    if (token) {
      return res.status(200).json({success: true});
    }
    return res.status(401).json({ success: false});
  } catch(err) {
    res.status(400).json({ success: false });
  }
})

module.exports = router;
