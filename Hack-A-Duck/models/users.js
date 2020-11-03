var mongoose=require('mongoose');
var schema=mongoose.Schema;
var passportLocalMongoose=require('passport-local-mongoose');

var User = new mongoose.Schema({
    name:{
        type:String
    },
    address:{
        type:String
    },
    age:{
        type:Number
    },
    mobno:{
        type:Number
    },
    Email:{
        type:String
    },
    admin:{
        type:Boolean,
        default:false
    }
});

User.plugin(passportLocalMongoose);//it automatically creates schema for username and password.
module.exports=mongoose.model('User',User);