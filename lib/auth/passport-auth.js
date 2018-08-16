const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Users = require("./../../models/users");
const bcrypt = require("bcrypt");

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    Users.findOne({ email: email }).then(user => {
      if (!user) return done(null, false, { messege: "user not found" });
      bcrypt.compare(password, user.password, (err, matched) => {
        if (err) return err;
        if (matched) return done(null, user);
        else return done(null, false, { messege: "password doesnot matched" });
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Users.findById({ id })
    .then((err, user) => {
      done(null, user);
    })
    .catch(e => console.log(e));
});
