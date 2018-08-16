const express = require("express");
const _ = require("lodash");
const slugify = require("slugify");
const { ObjectID } = require("mongodb");
const router = express.Router();
const Items = require("./../models/items");
const Users = require("./../models/users");
const Categories = require("./../models/categories");
const multer = require("multer");
const passport = require("passport");
const isAuthenticated = require("./../middlewares/auth/authorization");
const identicon = require("./../middlewares/identicon");
require("./../lib/auth/passport-auth");

// multer configuration start
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
// multer configuration end

// All GET request start

router.get("/", (req, res) => {
  res.send("Hey this is working");
});

router.get("/items", (req, res) => {
  Items.find()
    .then(doc => res.json(doc))
    .catch(e => console.log(e));
});

router.get("/item/:slug", (req, res) => {
  Items.findOne({ slug: req.params.slug })
    .then(doc => {
      res.json(doc);
    })
    .catch(e => res.status(404).send());
});

router.get("/categories", (req, res) => {
  Categories.find({})
    .select("-_id")
    .populate("items", "slug")
    .then(doc => {
      res.json(doc);
    })
    .catch(e => console.log(e));
});

router.get("/category/:slug", (req, res) => {
  res.send("category specific things");
});

router.get("/users", (req, res) => {
  Users.find({}).then(user => {
    res.send(user);
  });
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.status(200).send("Logout Successfully");
});
// All GET request end

// All POST request start
router.post("/create_items", upload.single("item-image"), (req, res) => {
  let body = _.pick(req.body, [
    "title",
    "item_id",
    "content",
    "category",
    "item_image"
  ]);
  let slug = slugify(body.title).toLowerCase();
  Promise.all([
    Categories.findOne({ catTitle: body.category }),
    Items.findOne({ item_id: body.item_id, slug: slug })
  ]).then(([cat, doc]) => {
    if (doc) {
      return res.send("title already exist. Please try a different One");
    }
    let item = new Items({
      title: body.title,
      item_id: body.item_id,
      content: body.content,
      slug: slug,
      item_image: req.file.path
    });

    item
      .save()
      .then(items => {
        if (cat) {
          items = items._id;
          return cat.push(items);
        }
        let category = new Categories({
          catTitle: body.category
        });
        category.items = items._id;
        category.save();
        res.json(items);
      })
      .catch(e => console.log(e));
  });
});

router.post("/signup", (req, res) => {
  let body = _.pick(req.body, [
    "firstname",
    "lastname",
    "email",
    "username",
    "password"
  ]);
  Users.findOne({ email: body.email })
    .then(user => {
      if (user) {
        return res.status(404).send("User already exist");
      }
      let newUser = new Users(body);
      newUser.password = newUser.encryptPassword(body.password);
      newUser.userImg = identicon(body.username);
      newUser
        .save()
        .then(doc => {
          if (!doc) {
            console.log("user could not be created");
          }
          res.send(doc);
        })
        .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    if (!user) {
      return res.status(409).send("User or Password does not matched");
    }
    req.logIn(user, function(err) {
      if (err) {
        console.error(err);
        return next(err);
      }
      return res.send(user);
    });
  })(req, res, next);
});

// router.post("/login", (req, res) => {
//   res.send("hey");
// });
// All POST request ends

// All PATCH and DELETE request start
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
          res.json(doc);
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

router.delete("/:username", (req, res) => {
  Users.findOneAndRemove({ username: req.params.username }).then(user => {
    if (user) return res.send("Account deleted successfully");
    res.status(404).send("user not found");
  });
});

// All PATCH and DELETE request end

module.exports = router;
