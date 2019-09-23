// configure env from .env file
require('dotenv').config();

const config = {
  secret: process.env.secret,
  sessionKey: process.env.sessionKey,
  DBURL: process.env.DBURL,
  // facebook: {
  //   clientId: '34534',
  //   clientSecret: 'dfgfd',
  //   callbackURL: 'dfgfd'
  // },
  google: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  }
};

module.exports = {
  config
};
