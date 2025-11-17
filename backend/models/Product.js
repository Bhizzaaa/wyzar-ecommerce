// In backend/models/Product.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  // Link to the seller (User model)
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This links it to our User model
    required: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  images: [
    {
      type: String, // We will store file paths to the images
      required: true
    }
  ],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  // As per your MVP doc [cite: 39]
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  quantity: { // This is the 'stock availability' [cite: 39]
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 1
  },
  // As per your 'full' features doc [cite: 2]
  deliveryTime: {
    type: String,
    trim: true
  },
  countryOfOrigin: {
    type: String,
    trim: true
  },
  // We can add ratings later
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);