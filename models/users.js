const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    minlength: 2
  },
  lastname: {
    type: String
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not an email"
    }
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true
  },
  userImg: {
    type: String
  },
  token: {
    type: String,
    unique: true
  }
});

userSchema.methods.toJSON = function() {
  return {
    username: this.username,
    email: this.email
  };
};

userSchema.methods.encryptPassword = function(password) {
  let salt = bcrypt.genSaltSync(10);
  console.log(salt, password);
  return bcrypt.hashSync(password, salt, null);
};

userSchema.statics.findByCredentials = function(email, password) {
  let user = this;
  return user.findOne({ email }).then(doc => {
    if (!doc) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(doc);
        }
        reject();
      });
    });
  });
};
let User = mongoose.model("User", userSchema);
module.exports = User;
