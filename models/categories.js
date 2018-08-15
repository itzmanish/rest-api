const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  catTitle: {
    type: String,
    required: true
  },
  items: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Items",
    required: true
  }
});

const category = mongoose.model("Categories", categorySchema);
module.exports = category;
