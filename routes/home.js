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
const identicon = require("./../middlewares/identicon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("./../lib/auth/passport-auth");

const isAuthenticated = require("./../middlewares/auth/authorization");

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

router.get("/me", isAuthenticated, (req, res) => {
  console.log(req.user);
  res.send(req.user);
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/logout", (req, res) => {
  req.logOut();
  res.status(200).send("Logout Successfully");
});

router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user } = req;

    res.status(200).send({ user });
  }
);

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

router.post("/signup", async (req, res) => {
  let body = _.pick(req.body, [
    "firstname",
    "lastname",
    "email",
    "username",
    "password"
  ]);
  // authentication will take approximately 13 seconds
  // https://pthree.org/wp-content/uploads/2016/06/bcrypt.png
  const hashCost = 10;

  try {
    let user = await Users.findOne({ username: body.username });
    if (user) {
      return res.status(404).json("User already exist");
    }
    let newUser = new Users(body);
    newUser.userImg = identicon(body.username);
    newUser.password = await bcrypt.hash(body.password, hashCost);

    let userData = await newUser.save();
    res.status(200).json(userData);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "req body should take the form { email, password }"
    });
  }
});

router.post("/login", (req, res) => {
  passport.authenticate("local", (error, user) => {
    if (error || !user) {
      return res.status(400).json({ error });
    }
    /** This is what ends up in our JWT */
    const payload = {
      username: user.username,
      expires: Date.now() + parseInt(18000)
    };

    /** assigns payload to req.user */
    req.login(user, error => {
      if (error) {
        res.status(400).json({ error });
      }

      /** generate a signed json web token and return it in the response */
      // const token = jwt.sign(JSON.stringify(payload), "Isken1che426B@mHai?");

      /** assign our jwt to the cookie */
      // res.cookie("ads", jwt, { httpOnly: true, secure: true });
      res.status(200).json({ user });
    });
  })(req, res);
});


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
