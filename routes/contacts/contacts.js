const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Contact = require('../../models/Contacts')

// Define Joi schema for input validation
const contactSchema = Joi.object({
    ref: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email(),
    phone: Joi.number().required(),
    subject: Joi.string(),
    status: Joi.string().min(2).max(30).required(),
    // user: Joi.string().required(),
    description: Joi.string(),
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
            const contacts = await Contact.find();
            res.json(contacts);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });


// add a user by an admin (only accessible by admin)
//router.post("/addUser", authenticateUser, authorizeAdmin, async (req, res) => {
    router.post("/addContact", async (req, res) => {

        console.log("--------addContact---------" , req.body);
    try {
        // Validate request body against Joi schema
        const { error } = contactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }       

        // Create a new contact
        const contact = new Contact({
            ref: req.body.ref,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            subject: req.body.subject,
            status: req.body.status,
            // user: req.body.user,
            description: req.body.description,
        });

        // Save the contact
        await contact.save();
        const id = contact._id ;

        res.status(201).json({id, message: "Contact added successfully" });
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
    const contact = await Contact.findById(req.params.id);
    res.json(contact);
} catch (err) {
    res.status(500).json({ message: err.message });
}

});




// update user information (only accessible by admin)
//router.patch("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
    router.patch("/:id", async (req, res) => {
    try {
        // Validate request body against Joi schema
        const { error } = contactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Find the user by ID
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        
       console.log("PATCH" , req.body);
        // Update user fields if provided in request body
        if (req.body.ref) {
            contact.ref = req.body.ref;
        }

        if (req.body.name) {
            contact.name = req.body.name;
        }
        if (req.body.email) {
            contact.email = req.body.email;
        }

        if (req.body.status) {
            contact.status = req.body.status;
        }
        if (req.body.phone) {
            contact.phone = req.body.phone;
        }
        if (req.body.subject) {
            contact.subject = req.body.subject;
        }

        // if (req.body.user) {
        //     contact.user = req.body.user;
        // }
        if (req.body.description) {
            contact.description = req.body.description;
        }


        // Save the updated user
         await contact.save();


        res.status(200).json({ message: "Contact updated successfully" });
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
        const contact = await Contact.findById(req.params.id);
      //  res.json(user);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
      
        await contact.deleteOne({ _id: req.body._id });
        res.json({ message: 'Contact deleted' });
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