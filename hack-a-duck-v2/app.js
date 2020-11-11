//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const path = require('path');
const mongoose = require("mongoose");
const session = require('express-session');

const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const multer = require('multer');
const e = require('express');
const upload = multer({ dest: 'public/uploads/' })
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SECRET1,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DBCLUSTER, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

var storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

var uploads = multer({
    storage: storage
}).single('file')
const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    selected: String,
    phone: String,
});
const donorSchema = new mongoose.Schema({
    name: String,
    username: String,
    selected: String,
    phone: String,
    address: String,
    postal: String,
    donation_type: String,
    image: String,
    verify: false
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
const Donor = new mongoose.model('Donor', donorSchema);
// const Admin = new mongoose.model("Admin", adminSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.render("homePage");
});
app.get('/register', function (req, res) {
    res.render('register', { message: '' });
});
app.get('/login', function (req, res) {
    res.render('login', { message: '' });
});
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});
app.get("/dashboard", function (req, res) {
    if (req.isAuthenticated()) {
        Donor.find({ username: req.user.username }, function (err, found) {
            if (err) {
                console.log(err);
            } else {
                if (found) {
                    res.render('dashboard', { user: found, name: req.user.name })
                }
            }
        });
    } else {
        res.redirect("/login");
    }
});
app.get('/donate', function (req, res) {
    if (req.isAuthenticated()) {
        res.render('donate', { userDetails: req.user });
    } else {
        res.redirect('/login');
    }
});
app.get('/userDonations', function (req, res) {
    if (req.isAuthenticated()) {
        Donor.find({ username: req.user.username }, function (err, found) {
            if (err) {
                console.log(err);
            } else {
                if (found) {
                    res.render('yourdonation', { user: found });
                }
            }
        });
    } else {
        res.redirect("/login");
    }
});
app.get('/adminDashboard', function (req, res) {
    if (req.isAuthenticated()) {
        Donor.find({}, function (err, foundUsers) {
            if (err) {
                console.log(err);
            } else {
                res.render('admin', { users: foundUsers });
            }
        });

    } else {
        res.redirect('/login');
    }
});
app.get('/adminDashboard/:id', function (req, res) {
    if (req.isAuthenticated()) {
        const id = req.params.id;
        Donor.findOne({ _id: id }, function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    res.render('donorDetails', { user: foundUser, admin: req.user._id });
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});
app.post('/adminDashboard/:id', function (req, res) {
    if (req.isAuthenticated()) {
        const id = req.params.id;
        Donor.findOne({ _id: id }, function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    foundUser.verify = true;
                    foundUser.save();
                    res.redirect('/adminDashboard');
                }
            }
        });
    } else {
        res.redirect('/login');
    }
});
app.post('/donate', uploads, function (req, res, next) {
    if (req.isAuthenticated()) {
        const id = req.user.username;
        User.findOne({ username: id }, function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    const newDonor = new Donor({
                        name: req.body.name,
                        username: req.body.username,
                        selected: req.body.gender,
                        phone: req.body.phone,
                        address: req.body.address,
                        postal: req.body.postal,
                        donation_type: req.body.selected_donation,
                        image: req.file.filename,
                        verify: false
                    });
                    newDonor.save();
                    res.render('confirmation', { name: req.user.name });
                }
            }
        });
    } else {
        res.redirect('/login');
    }
})
app.get('/aboutus', function (req, res) {
    res.render('aboutus');
});
app.post("/register", function (req, res) {
    const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        selected: req.body.selected,
        phone: req.body.phone,
    });


    if (req.body.password !== req.body.confirm_password) {
        res.render('register', { message: 'Password does not match' });

    }
    else {
        if (req.body.password.length < 6) {
            res.render('register', { message: 'Password must be atleast 6 characters long' });

        } else if (req.body.phone.length < 10 || req.body.phone.length > 10) {
            res.render('register', { message: 'Please enter a valid phone number and try again' });
        }
        else {
            User.findOne({ username: req.body.username }, function (err, foundUser) {
                if (err) {
                    console.log(err);
                } else {
                    if (foundUser) {
                        res.render('register', { message: 'User already exists' });

                    } else {
                        User.register(newUser, req.body.password, function (err, user) {
                            if (err) {
                                res.redirect("/register");
                            } else {
                                res.render('register', { message: 'Successfully registered' });

                            }
                        });
                    }
                }
            });
        }
    }
});
app.post("/login", passport.authenticate('local', { failWithError: true }), function (req, res) {


    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            User.findOne({ username: req.body.username }, function (err, foundUser) {
                if (err) {
                    console.log(err);
                } else {
                    if (foundUser) {
                        if (foundUser._id == process.env.ADMINID) {
                            passport.authenticate("local")(req, res, function () {

                                if (err) {
                                    console.log(err);
                                } else {
                                    res.redirect("/adminDashboard");
                                }
                            });
                        } else {
                            passport.authenticate("local")(req, res, function () {

                                if (err) {
                                    console.log(err);
                                } else {
                                    res.redirect("/dashboard");
                                }
                            });
                        }


                    }
                }
            });

        }
    });
}, function (err, req, res, next) {
    return res.render('login', { message: 'Username or password is incorrect' });
});
let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});
