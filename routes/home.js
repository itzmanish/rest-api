const express = require("express");
const _ = require("lodash");
const slugify = require("slugify");
const { ObjectID } = require("mongodb");
const router = express.Router();
const Items = require("./../models/items");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./../uploads");
  },
  filename: function(req, file, cb) {
    let fileName = (new Date() + "-" + file.originalname).trim();
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    return cb(null, true);
  }
  cb(new Error(`File doesn't saved`), false);
};
var upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get("/", (req, res) => {
  res.send("Hey this is working");
});

router.get("/items", (req, res) => {
  Items.find({})
    .then(doc => res.send(doc))
    .catch(e => console.log(e));
});

router.get("/item/:slug", (req, res) => {
  Items.findOne({ slug: req.params.slug })
    .then(doc => {
      res.send(doc);
    })
    .catch(e => res.status(404).send());
});

router.get("/categories", (req, res) => {
  res.send("all categories");
});

router.get("/category/:slug", (req, res) => {
  res.send("category specific things");
});

router.post("/create_items", upload.single("item-image"), (req, res) => {
  let body = _.pick(req.body, [
    "title",
    "item_id",
    "content",
    "category",
    "item_image"
  ]);
  let slug = slugify(body.title).toLowerCase();
  Items.findOne({ item_id: body.item_id, slug: slug }).then(doc => {
    if (doc) {
      return res.send("title already exist. Please try a different One");
    }
    let item = new Items({
      title: body.title,
      item_id: body.item_id,
      content: body.content,
      category: body.category,
      slug: slug,
      item_image: req.file.path
    });
    item
      .save()
      .then(items => res.send(items))
      .catch(e => console.log(e));
  });
});

router.patch("/edit/:id", upload.single("item-image"), (req, res) => {
  let body = _.pick(req.body, [
    "title",
    "item_id",
    "content",
    "category",
    "slug",
    "item_image"
  ]);
  body.slug = slugify(body.title).toLowerCase();
  body.item_image = req.file.path;
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(404).send("seems not valid id");
  }
  Items.findOne({ slug: body.slug })
    .then(item => {
      if (!item || item._id == req.params.id) {
        Items.findByIdAndUpdate(
          req.params.id,
          { $set: body },
          { new: true }
        ).then(doc => {
          if (!doc) {
            return res.status(404).send("Items not found");
          }
          res.send(doc);
        });
      } else if (item) {
        return res
          .status(404)
          .send("Title already exist choose a different one");
      }
    })
    .catch(e => console.log(e));
});

router.delete("/delete_all", (req, res) => {
  Items.find({})
    .then(doc => {
      if (!doc) {
        return res.send("no documents found");
      }
      Items.deleteMany({})
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
