const express = require("express");
const userRouter = express.Router();
const User = require("../models/user.model");
const Product = require("../models/product.model");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

userRouter.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user).populate("addedProducts");
    res.json({
      name: user.name,
      phone: user.phone,
      addedProducts: user.addedProducts,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

userRouter.post("/add", auth, async (req, res) => {
  try {
    const { userId, category, pName, pPrice } = req.body;
    const user = await User.findById(userId);

    const newProduct = new Product({
      user: user._id,
      name: pName,
      price: pPrice,
      category,
    });

    const currProduct = await Product.create(newProduct);
    user.addedProducts.unshift(currProduct._id);
    await user.save();

    res.status(200).json({
      success: true,
      data: currProduct,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

userRouter.delete("/delete/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    const index = product.user.addedProducts.indexOf(id);
    if (index > -1) product.user.addedProducts.splice(index, 1);

    await product.user.save();
    await product.remove();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

userRouter.post("validateToken", async (req, res) => {
  try {
    const token = req.header("user-auth-token");
    if (!token) return res.json(false);

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.json(false);

    const user = await User.findById(verified._id);
    if (!user) return res.json(false);

    return res.json(true);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// userRouter.post()
module.exports = userRouter;
