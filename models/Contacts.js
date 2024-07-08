const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  
  ref: {
    type: String,
    required: true,
    min: 1,
    max: 255,
  },
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

  phone: {
    type: Number,
    required: true
  },

  subject: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
    max: 30,
    min: 2,
  },
  // user: {
  //   type: String,
  //   required: true
  // },
  description: {
    type: String,
    required: false
  },

  date: {
    type: Date,
    default: Date.now(),
  }
});

module.exports = mongoose.model("Contact", contactSchema);
