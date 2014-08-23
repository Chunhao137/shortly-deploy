var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');
var Promise = require('bluebird');
var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
// Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({},function(err,docs) {
    if (err) console.log(err);
    res.send(200, links.models);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.find({url: uri}, function(err, link){
    if(link) {
      if(err) {console.log(err)};
      res.send(200, found.attributes);
     }else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save(function(err){
          if(err) console.log(err);
          res.send(200, newLink);
        })

      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }, function(err, user){
    if(err) console.log(err)
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        })
      }
  })
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }, function(err, user){
    if(err){ console.log(err); }
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });



        newUser.save(function(err){
          if(err) {console.log("Error!")}
            util.createSession(req, res, newUser);
            Users.add(newUser);
        })
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
  })
};

exports.navToLink = function(req, res) {
  Link.find({code: req.params[0]}, function(err, link){
    if (!link) {
      res.redirect('/');
    } else {
      link.visits = link.visits +1;
      link.save(function(err){
        if(err) {console.log(err)}

        return res.redirect(link.url);

      })
    }
  })
}
