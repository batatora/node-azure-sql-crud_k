var express = require('express');
var app = express();
var path = require('path');
var session = require("express-session");
var passport = require('./passport');
var db = require('./db');
app.use(express.json());
app.use(express.static('public'));
app.use(session({ secret: "my secret" }));

app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req, res) { res.sendFile(path.join(__dirname + '/public/login.html')); });
app.get('/signup', function(req, res) { res.sendFile(path.join(__dirname + '/public/signup.html')); });
app.get('/customer', function(req, res) { res.sendFile(path.join(__dirname + '/public/customer.html')); });
app.get('/admin', function(req, res) { res.sendFile(path.join(__dirname + '/public/admin.html')); });
app.get('/staff', function(req, res) { res.sendFile(path.join(__dirname + '/public/staff.html')); });

app.get('/home', function(req, res) {
  console.log(req.user);
  if (!req.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname + '/public/index.html'));
})

app.post('/api/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(400).json({ error: true, message: 'Authentication failed.' }); }
    return res.send({ message: 'login success', user: user });
  })(req, res, next);
});

app.post('/api/register', function(req, res, next) {
  db.executeQuery(`insert into users (name, email, password, role) values ('${req.body.name}', '${req.body.email}', '${req.body.password}', 2)`).then(result => {
    res.json({ message: 'successfully registered' });
  }).catch(err => {
    res.status(400).json({ error: true, message: 'user registration failed' });
  });
});

app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});
