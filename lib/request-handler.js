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
  Link.find({},function(err,link) {
    if (err) console.log(err);
    res.send(200, link);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }
    console.log('link save 4');

  Link.find({url: uri}, function(err, link){
    console.log('link save 1');

    if(link.length>0) {
      if(err) {console.log(err)};
      console.log('link save 2', link);

      res.send(200, link);
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
        console.log('link save 3', link);

         link.createSha(link.url);
        link.save(function(err){
          if(err) console.log(err);
          res.send(200, link);
        })

      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user){
    if(err) console.log(err)
      if (!user) {
        res.redirect('/login');
      } else {
        console.log('user', user);
        user.comparePasswords(password, function(match) {
          if (match) {
            console.log("herrrrrrrre")
            util.createSession(req, res, user.username);
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
  console.log('sign up')
  console.log('username', username)
  User.find({ username: username }, function(err, user){
    console.log('user singup', user)
      if (!user[0]) {
        console.log('user does not exists')
        var newUser = new User({
          username: username,
          password: password
        });


        //newUser.password = newUser.hashPassword(password);
        newUser.hashPassword().then(function(){

        newUser.save(function(err){
          if(err) {console.log("Error!")}
            util.createSession(req, res, newUser);
        })
      })
    }

    else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
  })
};

exports.navToLink = function(req, res) {
  // Link.find({code: req.params[0]}, function(err, link){
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.visits = link.visits +1;
  //     link.save(function(err){
  //       if(err) {console.log(err)}

  //       return res.redirect(link.url);

  //     })
  //   }
  // })
}
