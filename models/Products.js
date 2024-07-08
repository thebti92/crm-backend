const { object, required } = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    refprod: {
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
      img: {
        type: String,
        required: true,
        max: 255,
      },
      description: {
        type: String,
        required: true,
        max: 255,
      },
      colors: [ {title: String}], // Array of objects containing only the title
      size: [ {title: String}], // Array of objects containing only the title


    price: {
      type: Number,
      required: true
    },
    
   
    tax: {
        type: Number,
        required: true
      },

    promo: {
        type: Number,
        required: false
      },

    pricetax: {
        type: Number,
        required: true
      },
    
      stock: {
        type: Number,
        required: true,
      },

      weight: {
        type: Number,
        required: false,
      },

      category: { 
        type: {label: String},
        required: true
    },
    //  size: {label: String},
      

      publish: {
        type: Boolean,
        required: true
      },
    
      date: {
        type: Date,
        default: Date.now(),
      }
    });

module.exports = mongoose.model("Product", productSchema);
