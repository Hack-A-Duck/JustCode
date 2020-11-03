var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var User=require('./models/users');


exports.local=passport.use(new LocalStrategy(User.authenticate()));// authenticate is a pre-defined function, checks for username and password.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());