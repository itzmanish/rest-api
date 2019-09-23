const express = require('express');
const router = express.Router();
const oauth = require('./../models/oauth');
const passport = require('passport');
require('./../lib/auth/passport-oauth');

// facebook auth
router.get('/facebook', passport.authenticate('facebook'), (req, res) => {});
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.send('authenticated');
  }
);

// google auth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/login/callback',
  passport.authenticate('google', {
    successRedirect: '/me',
    failureRedirect: '/fail'
  })
);

module.exports = router;
