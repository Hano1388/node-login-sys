const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

// Register
router.get('/register', (req, res) => {
  res.render('register');
});

// Login
router.get('/login', (req, res) => {
  res.render('login');
});

// Register user
router.post('/register', (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let password2 = req.body.password2;

  // validations
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not much').equals(req.body.password);

  let errors = req.validationErrors();
  if (errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    });
    User.createUser(newUser, (err, user) => {
      if(err) throw err;
      console.log(user);
    });
    req.flash('success_msg', 'You are registered and can now login');
    res.redirect('/users/login');
  }
});

// getting the user name, matches it and validates the password with local-stratigy

passport.use(new LocalStrategy((username, password, done) => {
  // getUserByUsername is a function from user model
    User.getUserByUsername(username, (err, user) => {
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown User'});
      }
      // comparePassword is another function that we need to create in user model
      User.comparePassword(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {message: 'Invalid password'});
        }
      })
    });
  }));

  // Serialize and Deserialize password
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect: '/users/login', failureFlash: true}),
  (req, res) => {
    res.redirect('/');
  });

router.get('/logout', (req, res) => {
  req.logout();

  req.flash('success_msg', 'You are logged out');

  res.redirect('/users/login');
});

module.exports = router;
