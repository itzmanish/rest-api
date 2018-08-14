const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const itemSchemas = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    trim: true,
    required: true
  },
  item_id: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  available: {
    type: Boolean,
    default: true
  },
  _creatorID: {
    type: mongoose.Schema.Types.ObjectId
  }
});

itemSchemas.plugin(timestamps);
itemSchemas.methods.toJSON = function() {
  return {
    _id: this._id,
    slug: this.slug,
    item_id: this.item_id,
    title: this.title,
    category: this.category,
    content: this.content,
    available: this.available,
    _creatorID: this._creatorID,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};
let item = mongoose.model("item", itemSchemas);

module.exports = item;
