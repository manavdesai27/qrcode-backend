const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    restaurant: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    addedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product"
      }
    ]
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
