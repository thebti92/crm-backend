const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Product = require('../../models/Products')

// Define Joi schema for input validation
const productSchema = Joi.object({
    refprod: Joi.string().required(),
    name: Joi.string().required(),
    img: Joi.string().required(),
    description: Joi.string().required(),

  colors: Joi.array().items({ title: Joi.string().required() }).required(),
  size: Joi.array().items({ title: Joi.string().required() }).required(),
    price: Joi.number().required(),
    tax: Joi.number().required(),
    promo: Joi.number().allow(''),
    pricetax: Joi.number().required(),
    stock: Joi.number().required(),
    weight: Joi.number().allow(''),
    category: Joi.object().required(),

    publish: Joi.boolean().required()
});


// ------------ Check permission -------------------------

// Middleware to authenticate users
const authenticateUser = (req, res, next) => {
    
    // Check if token is provided in headers
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. Token not provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Middleware to authorize admin users
const authorizeAdmin = (req, res, next) => {
    // Check if user has admin role
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin permission required.' });
    }
};

// ------------ end Checking permission -------------------------


// Get all users (only accessible by admin)
//router.get('/', authenticateUser, authorizeAdmin, async (req, res) => {
    router.get('/', async (req, res) => {
  
        try {
            const products = await Product.find();
            res.json(products);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });


// add a user by an admin (only accessible by admin)
//router.post("/addUser", authenticateUser, authorizeAdmin, async (req, res) => {
    router.post("/addProducts", async (req, res) => {

        console.log("--------add Product---------" , req.body);
    try {
        // Validate request body against Joi schema
        const { error } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }       

        // Create a new product
        const product = new Product({
            refprod: req.body.refprod,
            name: req.body.name,
            img: req.body.img,
            description: req.body.description,
            colors: req.body.colors,
            size: req.body.size,
            price: req.body.price,
            tax: req.body.tax,
            promo: req.body.promo,
            pricetax: req.body.pricetax,
            publish: req.body.publish,
            stock: req.body.stock,
            weight: req.body.weight,
            category: req.body.category,
           
        });

        // Save the product
        await product.save();
        const id = product._id ;

        res.status(201).json({id, message: "product added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});







// Get a specific user by ID
router.get('/:id', async (req, res) => {

   try {
    const product = await Product.findById(req.params.id);
    res.json(product);
} catch (err) {
    res.status(500).json({ message: err.message });
}

});




// update user information (only accessible by admin)
//router.patch("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
    router.patch("/:id", async (req, res) => {
    try {
        // Validate request body against Joi schema
        const { error } = productSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Find the user by ID
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "product not found" });
        }
        
       console.log("PATCH" , req.body);
        // Update user fields if provided in request body
        if (req.body.refprod) {
            product.refprod = req.body.refprod;
        }

        if (req.body.name) {
            product.name = req.body.name;
        }
        if (req.body.img) {
            product.img = req.body.img;
        }

        if (req.body.price) {
            product.price = req.body.price;
        }

        if (req.body.tax) {
            product.tax = req.body.tax;
        }
        
           if (req.body.promo) {
            product.promo = req.body.promo;

           }else if (req.body.promo == ''){
                console.log('+++++++empty promo ++++++', req.body.promo);
                product.promo = undefined;
            } 
 

        if (req.body.pricetax) {
            product.pricetax = req.body.pricetax;
        }

        if (req.body.description) {
            product.description = req.body.description;
        }

        if (req.body.colors) {
            
            console.log("COLOR xx:", req.body.colors); 
          //  if (req.body.colors == '[]') {
                if (req.body.colors.length === 0) {
                console.log("EMPTY ARRAY !");
                product.colors = undefined ;
               
        } else {
            product.colors = req.body.colors;
        }


        }



        if (req.body.size) {
            
            console.log("size xx:", req.body.size); 
      
                if (req.body.size.length === 0) {
                console.log("EMPTY ARRAY !");
                product.size = undefined ;
               
        } else {
            product.size = req.body.size;
        }


        }

        

        // if (req.body.user) {
        //     product.user = req.body.user;
        // }
       
        if (req.body.stock) {
            product.stock = req.body.stock;
        }
        
        if (req.body.weight) {
            product.weight = req.body.weight;
        }else if (req.body.weight == ''){
            product.weight = undefined;
        }



        
        if (req.body.category) {
            product.category = req.body.category;
        }





        product.publish = req.body.publish;

        // Save the updated user
         await product.save();


        res.status(200).json({ message: "product updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.post('/updateStock', async (req, res) => {
// Controller function to update product stock
// const updateStock = async (req, res) => {
//     
      console.log("update stock request !", req.body);
      const { productId, quantity } = req.body;
      console.log("www productId www!", productId);
      console.log("www quantity www !", quantity);

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        console.log("XXXXXXXXXX product XXXXXXXX")
        product.stock = product.stock - quantity;
        await product.save();

        res.status(200).json({ message: 'Stock updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating stock', error: error.message });
    }
});


// Delete user (only admin)
//router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
    router.delete('/:id', async (req, res) => {
    try {

        // Find the user by ID
        const product = await Product.findById(req.params.id);
      //  res.json(user);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
      
        await product.deleteOne({ _id: req.body._id });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// Function to search user 
async function getUser(req, res, next) {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.user = user;
    next();
}

module.exports = router;