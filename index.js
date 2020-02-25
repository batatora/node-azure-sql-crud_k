var express = require('express');
var app = express();
var path = require('path');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var db = require('./db');

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  async function(email, password, done) {
    var result = await db.executeSelectQuery(`select email, password, name, role from uses where email='${email}'`);
    console.log(result);
    if (result.length === 0) {
        return done(null, false, { message: 'Incorrect email.'});
    }
    const user = result[0];
    if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.'});
    }
    return done(null, user);
  }
));

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/login.html'));
});

app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
);
app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});
