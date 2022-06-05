const Order = require("../models/Order");
const router = require("express").Router();
const CryptoJS = require("crypto-js");
const { verifyTokenAdmin, verifyTokenAuthorization } = require("./verifyToken");

// create new order

router.post("/", async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
    });
    await order.save();
    res.status(201).json({ message: "Order created successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// update order

router.put("/:id", verifyTokenAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete order

router.delete("/:id", verifyTokenAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("order deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete product in order 

router.delete("/product/:pid", async (req, res) => {
  try {
    await Order.updateOne({$pull: {products: {_id: req.params.pid}}});
    res.status(200).json("Product deleted")
  } catch (error) {
    res.status(500).json(error);
  }
})

// get user order

router.get("/find/:id", verifyTokenAuthorization, async (req, res) => {
  try {
    const order = await Order.find({ userId: req.params.id });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get all

router.get("/", verifyTokenAdmin, async (req, res) => {
  const latest = req.query.new;
  try {
    if (latest) {
      const order = await Order.find().sort({ createdAt: -1 }).limit(6);
      return res.status(200).json(order);
    }
    const order = await Order.find();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get monthly income

router.get("/income", verifyTokenAdmin, async (req, res) => {
  const productId = req.query.productId;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get total profit in year

router.get("/profit", verifyTokenAdmin ,async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  const previousYear = new Date(
    new Date().setFullYear(lastYear.getFullYear() - 1)
  );

  try {
    const profit = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastYear },
        },
      },
      {
        $project: {
          year: { $year: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$year",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(profit[0].total);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get pending orders

router.get("/pending", verifyTokenAdmin, async (req, res) => {
  try {
    const pendings = await Order.find({ status: "pending" });

    res.status(200).json(pendings);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get sales every 12 months

router.get("/sales", verifyTokenAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  const thisYear = new Date(date.setFullYear(date.getFullYear()));
  const previousYear = new Date(
    new Date().setFullYear(thisYear.getFullYear())
  );

  try {
    // get orders in this year
    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousYear },
        },
      },
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
    ]);

    const arr = Array(12).fill(0);
    
    const salesByMonth = sales.reduce((acc, curr) => {
      acc[curr.month - 1] += curr.sales;
      return acc;
    }, arr)


    res.status(200).json(salesByMonth);
  } catch (error) {
    res.status(500).json("error"+ error);
  }
});

module.exports = router;
