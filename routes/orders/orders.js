const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Order = require('../../models/Orders')

// Define Joi schema for input validation
const orderSchema = Joi.object({
    reford: Joi.string(),
    customer_id: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().required(),
    order_date: Joi.date().default(Date.now),
    status: Joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').default('pending'),
    total_amount: Joi.number().required(),
    shipping_address: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    products: Joi.array(),
    // created_at: Joi.date().default(Date.now),
    // updated_at: Joi.date().default(Date.now)
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
            const orders = await Order.find();
            res.json(orders);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });


// add a user by an admin (only accessible by admin)
//router.post("/addUser", authenticateUser, authorizeAdmin, async (req, res) => {
    router.post("/addOrder", async (req, res) => {

        console.log("--------addOrder---------" , req.body);
    try {
        // Validate request body against Joi schema
        const { error } = orderSchema.validate(req.body);
        if (error) {
            console.log(error);
           
            return res.status(400).json({ message: error.details[0].message });
        }       

        // Create a new Order
        const order = new Order({
            reford: req.body.reford,
            customer_id: req.body.customer_id,
            phone: req.body.phone,
            email: req.body.email,
            order_date: req.body.order_date,
            status: req.body.status,
            total_amount: req.body.total_amount,
            shipping_address: req.body.shipping_address,
            paymentMethod: req.body.paymentMethod,
            products: req.body.products,
            created_at: Date.now(),
            updated_at: "",
        });

        // Save the order
        await order.save();
        const id = order._id ;

        res.status(201).json({id, message: "order added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});







// Get a specific user by ID
router.get('/:id', authenticateUser, authorizeAdmin, async (req, res) => {


   // Find the user by ID
   /*
   const user = await User.findById(req.params.id);
   if (!user) {
       return res.status(404).json({ message: "User not found" });
   }
   */
   try {
    const order = await Order.findById(req.params.id);
    res.json(order);
} catch (err) {
    res.status(500).json({ message: err.message });
}

});




// update user information (only accessible by admin)
//router.patch("/:id", authenticateUser, authorizeAdmin, async (req, res) => {

    router.patch("/:id", async (req, res) => {
    try {
        // Validate request body against Joi schema
        const { error } = orderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Find the user by ID
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
       console.log("PATCH" , req.body);
        // Update user fields if provided in request body
        
        if (req.body.reford) {
            order.reford = req.body.reford;
        }
        
        if (req.body.customer_id) {
            order.customer_id = req.body.customer_id;
        }

        if (req.body.phone) {
            order.phone = req.body.phone;
        }
        if (req.body.email) {
            order.email = req.body.email;
        }

        if (req.body.order_date) {
            order.order_date = req.body.order_date;
        }
        if (req.body.status) {
            order.status = req.body.status;
        }

        if (req.body.total_amount) {
            order.total_amount = req.body.total_amount;
        }
        if (req.body.shipping_address) {
            order.shipping_address = req.body.shipping_address;
        }

        if (req.body.paymentMethod) {
            order.paymentMethod = req.body.paymentMethod;
        }


        if (req.body.created_at) {
            order.created_at = req.body.created_at;
        }

        if (req.body.updated_at) {
            order.updated_at = req.body.updated_at;
        }


        // Save the updated user
         await order.save();


        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



// Delete user (only admin)
//router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
    router.delete('/:id', async (req, res) => {
    try {

        // Find the user by ID
        const order = await Order.findById(req.params.id);
      //  res.json(user);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
      
        await order.deleteOne({ _id: req.body._id });
        res.json({ message: 'Order deleted' });
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