// In backend/routes/order.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Paynow } = require('paynow'); // Correct: require('paynow')

// Import our models
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// --- 1. Initialize Paynow ---
// Make sure these are in your .env file
const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID,
  process.env.PAYNOW_INTEGRATION_KEY
);

// Set the return and result URLs
paynow.returnUrl = process.env.PAYNOW_RETURN_URL;
paynow.resultUrl = " https://unintriguing-shila-unintellectually.ngrok-free.dev/api/orders/paynow/callback"; // Paynow -> Your Backend

// --- 2. Create Order & Initiate Payment Route ---
// @route   POST /api/orders/create
// @desc    Create a new order and get Paynow redirect URL
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const { shippingAddress, cartItems } = req.body;
    
    // Get the logged-in user
    const user = await User.findById(req.user.id);

    // --- A. Create Order in our DB ---
    
    // 1. Get product IDs from the cart
    const productIds = cartItems.map(item => item._id);

    // 2. Fetch the *real* product data from our DB (Security!)
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    let totalPrice = 0;
    const orderItems = [];

    // 3. Loop and calculate total price
    for (const cartItem of cartItems) {
      const dbProduct = dbProducts.find(p => p._id.toString() === cartItem._id);
      if (!dbProduct) {
        return res.status(404).json({ msg: `Product ${cartItem.name} not found` });
      }
      if (cartItem.cartQuantity > dbProduct.quantity) {
        return res.status(400).json({ msg: `Not enough stock for ${dbProduct.name}` });
      }

      const itemPrice = dbProduct.price * cartItem.cartQuantity;
      totalPrice += itemPrice;

      orderItems.push({
        name: dbProduct.name,
        quantity: cartItem.cartQuantity,
        image: dbProduct.images[0], // Save first image
        price: dbProduct.price,
        product: dbProduct._id,
      });
    }

    // 4. Create new order instance
    const newOrder = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      totalPrice,
      status: 'Pending', // We wait for Paynow confirmation
    });

    // 5. Save the pending order
    const savedOrder = await newOrder.save();
    
    // --- B. Create Paynow Payment ---

    // 1. Create a new payment
    // We use the Order ID as the invoice number
    const payment = paynow.createPayment(savedOrder._id.toString(), user.email);

    // 2. Add total as a single item
    payment.add("WyZar Order", savedOrder.totalPrice);
    
    // 3. Send the payment to Paynow
    const response = await paynow.send(payment);

    if (response.success) {
      // 4. Send back the redirect URL to the frontend
      res.json({
        orderId: savedOrder._id,
        paynowRedirectUrl: response.redirectUrl,
      });
    } else {
      console.error("Paynow error:", response.error);
      return res.status(500).json({ msg: "Paynow initiation failed", error: response.error });
    }

  } catch (err) {
    console.error("Create Order Error:", err.message);
    res.status(500).send('Server Error');
  }
});


// --- 3. Paynow Callback/Result Route ---
// @route   POST /api/orders/paynow/callback
// @desc    Paynow sends payment status updates here
// @access  Public (from Paynow)
router.post('/paynow/callback', async (req, res) => {
  try {
    const statusUpdate = req.body;

    // 1. Log the update from Paynow (for debugging)
    console.log("Paynow Callback Received:", statusUpdate);

    // 2. Find the order in your database
    // The 'reference' is the Order ID we sent to Paynow
    const order = await Order.findById(statusUpdate.reference);

    if (!order) {
      console.error(`Order not found: ${statusUpdate.reference}`);
      // Respond to Paynow
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Only update if it's still Pending
    if (order.status !== 'Pending') {
      console.log(`Order ${order._id} already processed. Status: ${order.status}`);
      return res.status(200).json({ msg: 'Order already processed' });
    }

    // 3. Verify the payment status
    // 'Paid' or 'Awaiting Delivery' are common success statuses
    const successfulStatus = ['Paid', 'Awaiting Delivery', 'Delivered'];

    if (successfulStatus.includes(statusUpdate.status)) {
      // 4. Update the order in your database
      order.status = 'Paid';
      order.paidAt = new Date();
      order.paymentResult = {
        id: statusUpdate.paynowreference,
        status: statusUpdate.status,
        update_time: new Date().toISOString(),
      };
      
      // --- IMPORTANT: Update Product Stock ---
      // We must decrease the quantity of products sold
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: -item.quantity } // Decrement quantity
        });
      }

      await order.save();
      console.log(`Order ${order._id} marked as Paid.`);
      
    } else {
      console.log(`Order ${order._id} status: ${statusUpdate.status}`);
      // Handle 'Cancelled' or 'Failed' statuses
      order.status = 'Cancelled';
      await order.save();
    }

    // 5. Respond to Paynow to acknowledge receipt
    res.status(200).json({ msg: 'Callback received' });

  } catch (err) {
    console.error("Callback Error:", err.message);
    res.status(500).send('Server Error');
  }
});


// --- 4. Get Logged-in User's Orders ---
// @route   GET /api/orders/myorders
// @desc    Get all orders for the logged-in user
// @access  Private
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- 5. Get Single Order by ID ---
// @route   GET /api/orders/:id
// @desc    Get a single order by its ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Security check: Make sure the user viewing the order is the one who made it
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;