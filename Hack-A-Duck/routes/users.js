var express = require('express');
var bodyParser=require('body-parser');
var User=require('../models/users');

var passport=require('passport')
var authenticate=require('../authenticate');
const { response } = require('express');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', (req, res, next) => {
    User.find({})
      .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
      }, (err) => next(err))
      .catch((err) => next(err));
  });
router.post('/signup', (req, res, next) => {
    User.register(new User({ name:req.body.name,address:req.body.address,age:req.body.age,mobileNo:req.body.mobno,Email:req.body.Email,username: req.body.username }), req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      }
      else {
        /*if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }*/
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: ' Registration Successful' });
          });
        });
      }
    });
  });

router.post('/login', passport.authenticate('local'),(req,res)=>{
  res.statusCode=200;
  res.setHeader('Content-Type','application/json');
  res.json({success:true,status:'You are Successfully logged IN'});
});

router.get('/logout',(req,res) => {
  if(req.session){
    req.session.destroy();//destroy all the sessions.
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else{
    var err=new Error('You are not logged in');
    res.statusCode=403;
    next(err);
  }
});

module.exports = router;