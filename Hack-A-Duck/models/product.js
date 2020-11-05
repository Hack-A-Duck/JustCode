const mongoose=require('mongoose');
const Schema=mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency=mongoose.Types.Currency;

const commentsSchema=new Schema({           //Creating new Schema.
    rating:{
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:{
       type: String,
       required: true
    }
},{
   timestamps: true
})

const productSchema=new Schema({
    name:{
        type: String,
        required : true,
        unique: true
    },
    description:{
        type: String,
        required: true
    },
    image:{
        type:String,
        required:true
    },
    label:{
        type:String,
        default : ''
    },category:{
        type:String,
        required: true
    },
    price:{
        type:Currency,
        required: true,
        min: 0
    },
    featured:{
        type:Boolean,
        required:false
    },
    comments:[commentsSchema]
},
{
    timestamps: true
    
});

var products=mongoose.model('product',productSchema);
module.exports=products;