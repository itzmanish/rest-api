const passport = require("passport");
const facebookStrategy = require("passport-facebook").Strategy;
const googleStrategy = require("passport-google-oauth2").Strategy;
// const twitterStrategy = require("passport-twitter").Strategy;
// const githubStrategy = require("passport-github2").Strategy;
// const instagramStrategy = require("passport-instagram").Strategy;

const oauth = require("./../../models/oauth");
const config = require("./../../oauth");

passport.use(
  new facebookStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      oauth.findOrCreate({ facebookId: profile.id }, function(err, user) {
        console.log(user || err);
        return cb(err, user);
      });
    }
  )
);

passport.use(
  new googleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      gid: oauth.google.googleID;
      oauth.findOne({ gid: profile.id }).then(existingUser => {
        if (existingUser) return done(null, existingUser);

        newOauth = new oauth({
          googleID: profile.id,
          googleName: profile.name,
          googleEmail: profile.email
        });
        if (profile.photos && profile.photos.length) {
          newOauth.googleImage = profile.photos[0].value;
        }
        newOauth
          .save()
          .then(user => {
            done(null, user);
          })
          .catch(e => console.log(e));
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  oauth.findById(id, function(err, user) {
    done(err, user);
  });
});
