const mongoose = require("mongoose");
const oauthSchema = new mongoose.Schema({
  google: {
    googleID: {
      type: String
    },
    googleName: {
      type: Array
    },
    googleImage: {
      type: Array
    },
    googleEmail: {
      type: String
    }
  },
  facebookID: {
    type: String
  }
});

module.exports = mongoose.model("oauth", oauthSchema);
