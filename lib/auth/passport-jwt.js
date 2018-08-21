const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require("bcrypt");

const Users = require("./../../models/users");

passport.use(
  new LocalStrategy(
    {
      usernameField: "username"
    },
    async (username, password, done) => {
      try {
        const userDocument = await Users.findOne({
          username
        });
        const passwordsMatch = await bcrypt.compare(
          password,
          userDocument.password
        );

        if (passwordsMatch) {
          return done(null, userDocument);
        } else {
          return done("Incorrect Username / Password");
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: req => req.cookies.ads,
      secretOrKey: "Isken1che426B@mHai?"
    },
    (jwtPayload, done) => {
      if (jwtPayload.expires > Date.now()) {
        return done("jwt expired");
      }

      return done(null, jwtPayload);
    }
  )
);
