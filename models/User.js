const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 1,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 6,
  },
  role: {
    type: String,
    required: true,
    max: 30,
    min: 2,
  },

  phone: {
    type: String,
    required: true
  },

  status: {
    type: Boolean,
    required: true
  },

  token: {
    type: String,
  },

  date: {
    type: Date,
    default: Date.now(),
  }
});

module.exports = mongoose.model("User", userSchema);
