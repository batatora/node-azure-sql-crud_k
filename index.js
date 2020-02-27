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

app.get('/signout', function(req, res) {
  req.session.user = null;
  res.redirect('/login');
});

app.get('/', function(req, res) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  if (req.session.user.role === 0 || req.session.user.role === 1) {
    return res.sendFile(path.join(__dirname + '/public/dashboard.html'));
  } else {
    return res.sendFile(path.join(__dirname + '/public/home.html'));
  }
});

app.post('/api/login', function(req, res, next) {
  if (!req.body.email && !req.body.password) {
    return res.status(400).send({ error: true, message: 'Please provide a valid email and password.' });
  }
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.status(400).json({ error: true, message: 'Authentication failed.' }); }
    req.session.user = user;
    return res.send({ message: 'login success', user: user });
  })(req, res, next);
});

app.post('/api/register', async function(req, res, next) {
  if (!req.body.email && !req.body.password) {
    return res.status(400).send({ error: true, message: 'Please provide a valid email and password.' });
  }
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
  db.executeQuery('select id, name, email, role from users').then(result => {
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
  db.executeQuery(`insert into users (name, email, password, role) values ('${req.body.name}', '${req.body.email}', '${req.body.password}', ${req.body.role})`).then(async result => {
    const user = await db.executeQuery(`select id, name, email, role from users where email='${req.body.email}'`);
    res.json({ data: user[0] });
  }).catch(err => {
    res.status(400).json({ error: true, message: 'unable to add user' });
  });
});

app.put('/api/users/:id', async function(req, res, next) {
  const id = req.params.id;

  let found = await db.executeQuery(`select * from users where id=${id}`);
  if (found.length === 0) {
    res.status(404).json({ error: true, message: 'user not found' });
    return;
  }

  const query = `update users set name='${req.body.name}', email='${req.body.email}', role=${req.body.role} where id=${id}`;
  console.log(query);
  db.executeQuery(query).then(async () => {
    const user = await db.executeQuery(`select id, name, email, role from users where email='${req.body.email}'`);
    res.json({ data: user[0] });
  }).catch(error => {
    console.log(error);
    res.status(400).json({ error: true, message: 'failed to update user'});
  })

});

app.delete('/api/users/:id', async function(req, res, next) {
  const id = req.params.id;

  let found = await db.executeQuery(`select * from users where id=${id}`);
  if (found.length === 0) {
    res.status(404).json({ error: true, message: 'user not found' });
    return;
  }

  db.executeQuery(`delete from users where id=${id}`).then(() => {
    res.json({ message: 'successfully deleted' });
  }).catch(() => {
    res.status(400).json({ error: true, message: 'unable to delete the user'});
  });
});

app.get('/api/users/:id', async function(req, res, next) {
  const id = req.params.id;

  let found = await db.executeQuery(`select * from users where id=${id}`);
  if (found.length === 0) {
    res.status(404).json({ error: true, message: 'user not found' });
    return;
  }

  db.executeQuery(`select id, email, name, role from users where id=${id}`).then(result => {
    res.json({ data: result[0] });
  }).catch((err) => {
    res.status(400).json({ error: true, message: 'unable to get the user details'});
  });
});

app.get('/api/profile', function(req, res, next) {
  res.json({ name: req.session.user.name, role: req.session.user.role });
});

app.listen(443, '0.0.0.0', function () {
  console.log('Example app listening on port 443!');
});
