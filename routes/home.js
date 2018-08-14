const express = require("express");
const _ = require("lodash");
const slugify = require("slugify");
const { ObjectID } = require("mongodb");
const router = express.Router();
const Items = require("./../models/items");

router.get("/", (req, res) => {
  res.send("Hey this is working");
});

router.get("/items", (req, res) => {
  Items.find({})
    .then(doc => res.send(doc))
    .catch(e => console.log(e));
});

router.get("/item/:slug", (req, res) => {
  res.send("specific item listing");
});

router.get("/categories", (req, res) => {
  res.send("listing categories");
});

router.get("/category/:slug", (req, res) => {
  res.send("category specific things");
});

router.post("/create_items", async (req, res) => {
  let body = _.pick(req.body, ["title", "item_id", "content", "category"]);
  let slug = slugify(body.title.trim()).toLowerCase();
  let doc = await Items.findOne({ slug });
  try {
    if (doc) {
      res.send("title already exist. Please try a different One");
    } else {
      let item = new Items({
        title: body.title,
        item_id: body.item_id,
        content: body.content,
        category: body.category,
        slug: slug
      });
      item
        .save()
        .then(doc => res.send(doc))
        .catch(e => console.log(e));
    }
  } catch (e) {
    console.log(e);
  }
});

router.delete("/delete_all", (req, res) => {
  Items.find({})
    .then(doc => {
      if (!doc) {
        return res.send("no documents found");
      }
      Items.remove({})
        .then(() => res.send("all documents deleted successfully"))
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
});

router.delete("/delete/:id", (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send();
  }
  Items.findOneAndRemove({ _id: req.params.id }).then(doc => {
    if (doc) {
      return res.send(`item deleted`);
    }
    res.status(404).send();
  });
});
module.exports = router;
