const express =require('express');
const bodyParser=require('body-parser');

const mongoose =require('mongoose');
const products = require('../models/product');
const authenticate = require('../authenticate');

const productRouter=express.Router();
productRouter.use(bodyParser.json());

productRouter.route('/')

.get((req,res,next)=>{
    products.find({})
    .then((product)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(product);
    },(err)=>next(err))
    .catch((err)=>next(err))
})
// adding product by user
.post((req,res,next)=>{
    products.create(req.body)
    .then((product)=>{
        console.log('product added',product);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(product );
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put((req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /products');
})
// deletes all the products
.delete((req,res,next)=>{
    products.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});
productRouter.route('/:productId')
//accessing product using product ID
.get((req,res,next)=>{
    products.findById(req.params.productId)
    .then((product)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(product);//takes input a json Sring and send back to client.
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    res.statusCode=403;
        res.end('POST operation not supported /product/'+ req.params.productId);
})
//modifying product using product ID
.put((req,res,next)=>{
    products.findByIdAndUpdate(req.params.productId,{$set:req.body
},{new:true})
.then((product)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json(product);//takes input a json Sring and send back to client.
},(err)=>next(err))
.catch((err)=>next(err));
})
.delete((req,res,next)=>{
    products.findByIdAndRemove(req.params.productId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});
productRouter.route('/:productId/comments')
.get((req,res,next)=>{
    products.findById(req.params.productId)  // returns the specific product in variable named product
    .then((product)=>{
        if(product!=null){
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(product.comments);      //returns the product comment
        }
        else{
            var err=new Error('product '+req.params.productId+' not found'); // creating an error.
            err.status=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    products.findById(req.params.productId) 
    .then((product)=>{
        if(product!=null){
            product.comments.push(req.body);
            product.save()
            .then((product)=>{
                products.findById(product._id)
                .then((product)=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(product.comments);      //returns the product comment
                })
            },(err)=>next(err));
        }
        else{
            var err=new Error('product '+req.params.productId+' not found');
            res.statusCode=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put((req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /products/'+req.params.productId+ ' /comments');
})
.delete((req,res,next)=>{
    products.findById(req.params.productId)
    .then((product)=>{
        if(product!=null){
           for(var i=(product.comments.length-1);i>=0;i--){
            product.comments.id(product.comments[i]._id).remove();
           }
           product.save()   //when we make any changes in the product we need to save it before returning it.
            .then((product)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(product.comments);      //returns the product comment
            },(err)=>next(err));
        }
        else{
            var err=new Error('product '+req.params.productId+' not found');
            res.statusCode=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});

productRouter.route('/:productId/comments/:commentId')
// getting the comment of the product using comment ID
.get((req,res,next)=>{
    products.findById(req.params.productId)  // returns the specific product in variable named product
    .then((product)=>{
        if(product!=null && product.comments.id(req.params.commentId)!=null){
        
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(product.comments.id(req.params.commentId));      //returns the product comment
        }
        else if(product== null){
            var err=new Error('product '+req.params.productId+' not found'); // creating an error.
            err.status=404;
            return next(err);
        }
        else {
            err=new Error('comment '+req.params.commentId+' not found'); // creating an error.
            err.status=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    res.statusCode=403;
        res.end('POST operation not supported /products/'+ req.params.productId+ ' /comments/ '+ req.params.commentId);
})
// modifies the comment made by the user.
.put((req,res,next)=>{
    products.findById(req.params.productId)  // returns the specific product in variable named product
    .then((product)=>{
        if(product!=null && product.comments.id(req.params.commentId)!=null){
            if(req.body.rating){
                product.comments.id(req.params.commentId).rating=req.body.rating;
            }
            if(req.body.comment){
                product.comments.id(req.params.commentId).comment=req.body.comment;
            }
            product.save()
            // displaying the product after modifing the comment.
            .then((product)=>{
                products.findById(product._id)
                .then((product)=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(product);      //returns the product comment
                })
            },(err)=>next(err));     
        }
        else if(product== null){
            var err=new Error('product '+req.params.productId+' not found'); // creating an error.
            err.status=404;
            return next(err);
        }
        else {
            err=new Error('comment '+req.params.commentId+' not found'); // creating an error.
            err.status=404;
            return next(err);
        }
    },(err)=>next(err))
.catch((err)=>next(err));
})
// deletes the comment of the product
.delete((req,res,next)=>{
    products.findById(req.params.productId)
    .then((product)=>{
        if(product!=null){
            product.comments.id(req.params.commentId).remove();
           
            product.save()   //when we make any changes in the product we need to save it before returning it.
            // displaying the product after deleting the comment 
            .then((product)=>{
                products.findById(product._id)
                .then((product)=>{
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(product);      //returns the product comment
                })
            },(err)=>next(err));
        }
        else if(product== null){
            var err=new Error('product '+req.params.productId+' not found'); // creating an error.
            err.status=404;
            return next(err);
        }
        else {
            err=new Error('comment '+req.params.commentId+' not found'); // creating an error.
            err.status=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});
module.exports=productRouter;