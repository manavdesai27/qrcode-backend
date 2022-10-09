const express = require("express");
const menuRouter = express.Router();
const User = require("../models/user.model");

menuRouter.get("/:id", async (req, res) => {
  let userid = req.params.id;
  try {
    const user = await User.findById(userid).populate("addedProducts");
    res.json({
      restaurant: user.restaurant,
      products: user.addedProducts,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = menuRouter;
