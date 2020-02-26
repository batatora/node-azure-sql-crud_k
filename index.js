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
app.get('/home', function(req, res) { res.sendFile(path.join(__dirname + '/public/home.html')); });
app.get('/dashboard', function(req, res) { res.sendFile(path.join(__dirname + '/public/dashboard.html')); });

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

app.post('/api/register', async function(req, res, next) {
  const found = await db.executeQuery(`select * from users where email='${req.body.email}'`);
  if (found.length) {
    res.status(400).json({ error: true, message: 'email is already used' });
    return;
  }
  db.executeQuery(`insert into users (name, email, password, role) values ('${req.body.name}', '${req.body.email}', '${req.body.password}', 2)`).then(result => {
    res.json({ message: 'successfully registered' });
  }).catch(err => {
    res.status(400).json({ error: true, message: 'user registration failed' });
  });
});

app.get('/api/users', function(req, res, next) {
  db.executeQuery('select name, email, role from users').then(result => {
    res.json({ data: result });
  }).catch(err => {
    res.status(400).json({ error: true, message: 'unable to fetch users'});
  })
});

app.post('/api/users', async function(req, res, next) {
  const found = await db.executeQuery(`select * from users where email='${req.body.email}'`);
  if (found.length) {
    res.status(400).json({ error: true, message: 'email is already used' });
    return;
  }
  db.executeQuery(`insert into users (name, email, password, role values ('${req.body.name}', '${req.body.email}', '${req.body.password}', ${req.body.role})`.then(result => {
    res.send({ data: req.body });
  })).catch(err => {
    res.status(400).json({ error: true, message: 'unable to add user' });
  });
});

app.delete('/api/users/:id', function(req, res, next) {
  const id = req.params.id;
  db.executeQuery(`delete from users where id=${id}`).then(() => {
    res.json({ message: 'successfully deleted' });
  }).catch(() => {
    res.status(400).json({ error: true, message: 'unable to delete the user'});
  });
});

app.get('/api/users/:id', function(req, res, next) {
  const id = req.params.id;
  db.executeQuery(`select id, email, name, role from users where id=${id}`).then(result => {
    res.json({ data: result[0] });
  }).catch((err) => {
    res.status(400).json({ error: true, message: 'unable to get the user details'});
  });
});

app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});
