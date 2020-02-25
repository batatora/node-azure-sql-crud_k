var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
var db = require('./db');

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    db.users.findById(id, function (err, user) {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

passport.use(new LocalStrategy(
    function (email, password, done) {
        console.log(email, password);
        console.log('using local startegy');
        return done('hello');
        // return db.executeSelectQuery(`select email, password, name, role from uses where email='${email}'`).then(result => {
        //     console.log(result);
        //     if (result.length === 0) {
        //         return done(null, false, { message: 'Incorrect email.' });
        //     }
        //     const user = result[0];
        //     if (user.password !== password) {
        //         return done(null, false, { message: 'Incorrect password.' });
        //     }
        //     return done(null, user);    
        // });
    }
));

module.exports = passport;