var express = require('express');
var app = express();
var path = require('path');
var session = require("express-session");
var passport = require('./passport');

app.use(express.static('public'));

app.use(session({ secret: "my secret" }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/login.html'));
});

app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' })
);
app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});
