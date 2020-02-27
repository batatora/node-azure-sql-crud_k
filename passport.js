var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
var db = require('./db');

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    db.executeQuery(`select id, email, name, role from users where id=${id}`).then(res => cb(null, res[0]));
});

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
    function (email, password, done) {
        return db.executeQuery(`select email, password, name, role from users where email='${email}'`).then(result => {
            if (result.length === 0) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            const user = result[0];
            if (user.password !== password) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

module.exports = passport;