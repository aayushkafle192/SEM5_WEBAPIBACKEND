const mongoose = require("mongoose");

const RibbonSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true
    },
    color: {
      type: String, 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ribbon", RibbonSchema);
