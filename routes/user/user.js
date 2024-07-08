const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../../models/User')

// Define Joi schema for input validation
const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().min(2).max(30).required(),
    phone: Joi.number().required(),
    status: Joi.boolean().required()
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
            const users = await User.find();
            res.json(users);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });




    // ****************************        *********************************************
// add a user by an admin (only accessible by admin)
//router.post("/addUser", authenticateUser, authorizeAdmin, async (req, res) => {
    router.post("/addUser", async (req, res) => {

        console.log("--------CREATE---------" , req.body);
    try {
        // Validate request body against Joi schema
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        
       const  testemail = req.body.email ;
        // Check if email already exists
      const emailExist = await User.findOne({ testemail });
      if (emailExist) {
        return handleError(res, 400, "Email Id already exists");
      }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create token
        const token = jwt.sign(
            { email: req.body.email, type: req.body.type, role: req.body.role },
            process.env.TOKEN_SECRET
        );


       

        // Create a new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
      //      password: req.body.password,    // test
            // token,
            role: req.body.role,
            phone: req.body.phone,
          //  status: req.body.status,
            status: true,
        });

        // Save the user
        await user.save();
        const id = user._id ;

        res.status(201).json({id, message: "User added successfully" });
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
    const user = await User.findById(req.params.id);
    res.json(user);
} catch (err) {
    res.status(500).json({ message: err.message });
}

});




// update user information (only accessible by admin)
//router.patch("/:id", authenticateUser, authorizeAdmin, async (req, res) => {
    router.patch("/:id", async (req, res) => {
    try {
        // Validate request body against Joi schema
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Find the user by ID
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
       console.log("PATCH" , req.body);
        // Update user fields if provided in request body
        if (req.body.name) {
            user.name = req.body.name;
        }
        if (req.body.email) {
            user.email = req.body.email;
        }
       
       
       
       
        // if (req.body.password) {

        //     //check if difference
        //     const isMatch = await bcrypt.compare(req.body.password, user.password);
        
        //     console.log("req.body.password...", req.body.password);
        //     console.log("user.password...", user.password);

            
        // console.log("isMatch...", isMatch);
        // if (!isMatch){
        //     // Hash the new password
        //     const salt = await bcrypt.genSalt(10);
        //     const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //     user.password = hashedPassword;
        // }


        // }


        // PASSWORD ----------
            // Check if user password matches
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    console.log("REQ BODY !!", req.body.password);
    console.log("User password !!", user.password);
    console.log("VALID password !!", validPassword);

    if (validPassword) {
        console.log("UPDATING PASSWORD !!");
         // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
 
         user.password = hashedPassword;
    }


        if (req.body.role) {
            user.role = req.body.role;
        }
        if (req.body.phone) {
            user.phone = req.body.phone;
        }

        // if (req.body.status) {
            user.status = req.body.status;
        // }
        
        // Save the updated user
         await user.save();

         // Generate new token with updated user information
        //  const token = jwt.sign(
        //      { email: user.email, type: user.type, role: user.role },
        //      process.env.TOKEN_SECRET
        //  );
 
         // Update user token in the database
        // user.token = token;
         await user.save();

        res.status(200).json({ message: "User updated successfully" });
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
        const user = await User.findById(req.params.id);
      //  res.json(user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
      
        await user.deleteOne({ _id: req.body._id });
        res.json({ message: 'User deleted' });
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