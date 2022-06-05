const express = require("express");
const mongoose = require("mongoose");
const app = express();
const authRouter = require("./routes/auth");
const userRouter = require("./routes/users");
const productRouter = require("./routes/products");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const reviewRouter = require("./routes/review");
const postCharge = require("./routes/postCharge");

require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("mongodb is ready!");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/review", reviewRouter);
app.use("/api/stripe/", postCharge);

app.listen((port = process.env.PORT || 5000), () => {
  console.log(`Server is running on port ${port}`);
});
