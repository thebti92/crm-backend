const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Joi = require("joi");

const secret_key = process.env.TOKEN_SECRET;

if (!secret_key) {
  throw new Error("Missing TOKEN_SECRET environment variable");
}

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().min(2).max(30).default('User').optional(),
  phone: Joi.number().required(),
  status: Joi.boolean().default(true).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

//SIGNUP USER
router.post("/register", async (req, res) => {
  console.log("--------REGISTER---------", req.body);
  const { name, email, password, phone } = req.body;
  const role = req.body.role || 'User';
  const status = req.body.status || true;

  console.log("--------REGISTER---------", role, status);

  try {
    // Validate request body against Joi schema
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if email already exists
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "Email Id already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      status,
    });

    // Save the user
    await user.save();
    res.status(201).json({ status: "200", message: "User added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//LOGIN USER
router.post("/login", async (req, res) => {
  try {
    console.log("LOGIN:", req.body);

    // Validate request body against Joi schema
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if user email exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "Email doesn't exist" });
    }

    // Check if user password matches
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    // Check if user is active
    if (user.status === 'banned') {
      return res.status(400).json({ message: "User not active!" });
    }

    // Generate JWT token
    const token = jwt.sign({ user_id: user._id,user_name: user.name, user_role: user.role, user_email: user.email, user_phone: user.phone}, secret_key, { expiresIn: '1h' });
  //  console.log("TOKEN:", token);

    res.header("auth-token", token).json({ status: "200", message: { token } });
    console.log("Login Success!");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;