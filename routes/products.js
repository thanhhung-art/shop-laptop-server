const Product = require("../models/Product");
const router = require("express").Router();
const { verifyTokenAdmin, verifyTokenAuthorization } = require("./verifyToken");

// create new product

router.post("/", verifyTokenAdmin, async (req, res) => {
  const newProduct = new Product(req.body);

  try {
    const saveProduct = await newProduct.save();
    res.status(201).json(saveProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// update product

router.put("/:id", verifyTokenAdmin, async (req, res) => {
  try {
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.status(200).json(updateProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// delete product

router.delete("/:id", verifyTokenAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("product has been deleted");
  } catch (error) {
    res.status(500).json(error);
  }
});

// find product by id

router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

// find products

router.get("/", async (req, res) => {
  const latest = req.query.new;
  const brand = req.query.brand;
  const featured = req.query.featured;
  const page = req.query.page;
  try {
    let products;
    if (page) {
      products = await Product.find()
        .limit(9)
        .skip(page * 9);
      return res.status(200).json({ products, next: Number(page) + 1 });
    } else if (latest) {
      products = await Product.find()
        .sort({
          createdAt: -1,
        })
        .limit(6);
    } else if (brand) {
      products = await Product.find({
        brand: brand,
      });
    } else if (featured) {
      products = await Product.find()
        .sort({
          price: -1,
        })
        .limit(4);
    } else {
      products = await Product.find();
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
});

// get amount of products

router.get("/amount", async (req, res) => {
  try {
    const amount = await Product.find().countDocuments();
    res.status(200).json(amount);
  } catch (error) {
    res.status(500).json(error);
  }
});

// create review or update review

router.post("/review/:id", verifyTokenAuthorization, async (req, res) => {
  // req.params.id === user id
  try {
    const product = await Product.findById(req.body.productId);
    const userReview = { ...req.body.review };

    if (product.reviews) {
      const userReviewed = product.reviews.find(
        (e) => e.userId === req.params.id
      );
      if (userReviewed) {
        const index = product.reviews.findIndex(
          (e) => e.userId === req.params.id
        );
        product.reviews[index] = userReview;
        await Product.findByIdAndUpdate(req.body.productId, product);
        return res
          .status(200)
          .json({ message: "Review updated", success: true });
      }

      product.reviews.push(userReview);
      await Product.findByIdAndUpdate(req.body.productId, product);
      return res.status(200).json({ message: "User reviewed", success: true });
    }

    product.reviews = [userReview];
    await Product.findByIdAndUpdate(req.body.productId, product);
    res
      .status(201)
      .json({ message: "Review created successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// get reviews

router.get("/review/:id", verifyTokenAuthorization, async (req, res) => {
  const product = await Product.findById(req.params.id);
  try {
    if (product.reviews) {
      return res.status(200).json({ reviews: product.reviews });
    }
    return res.status(200).json({ reviews: [] });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// post reply review

router.post("/reply/:pid/:uid", async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        const index = product.reviews.findIndex(e => e.userId === req.params.uid);
        product.reviews[index].reply.push(req.body);
        const productUpdate = await Product.findByIdAndUpdate(req.params.pid, product);
        const latestReply = req.body;
        res.status(200).json({ message: "success", latestReply });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong" });
    }
})

module.exports = router;
