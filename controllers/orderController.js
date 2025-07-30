// const Order = require('../models/OrderModels');
// const Product = require('../models/ProductModel');
// const crypto = require('crypto'); 

// const { sendEmail } = require('../services/emailService');
// const { createNotification } = require('../services/notificationService');

// const sendOrderReceivedNotifications = async (orderId) => {
//     try {
//         const order = await Order.findById(orderId).populate('userId', 'email firstName lastName');
//         if (!order || !order.userId) {
//             console.error(`Cannot send notification: Order or User not found for orderId ${orderId}`);
//             return;
//         }

//         const orderIdShort = order._id.toString().slice(-6).toUpperCase();
//         const customerName = order.userId.firstName || 'Valued Customer';
        
//         const emailSubject = `We've Received Your Order #${orderIdShort}`;
//         let emailHtml = '';
//         let webMessage = '';

//         switch (order.paymentMethod) {
//             case 'bank':
//                 webMessage = `Your order #${orderIdShort} is placed and pending. Our admin will verify the payment slip before confirming it.`;
//                 emailHtml = `
//                     <p>Hi ${customerName},</p>
//                     <p>Thank you for placing your order #${orderIdShort}.</p>
//                     <p><strong>Your order is pending until we manually verify your bank transfer receipt.</strong></p>
//                     <p>Once verified, we will process and ship your order. You’ll receive another notification once it's confirmed.</p>
//                     <p>Thank you for your patience and for shopping with us!</p>
//                 `;
//                 break;

//             case 'esewa':
//                 webMessage = `Your order #${orderIdShort} has been placed. Please complete the payment.`;
//                 emailHtml = `
//                     <p>Hi ${customerName},</p>
//                     <p>Thank you for your order! We have received order #${orderIdShort}.</p>
//                     <p>You should be redirected to eSewa to complete your purchase. If you are not redirected, please check your order details to find a payment link.</p>
//                     <p>We will notify you again once your payment is confirmed.</p>
//                     <p>Thank you for shopping with us!</p>
//                 `;
//                 break;

//             case 'cod':
//                 webMessage = `Your order #${orderIdShort} has been successfully placed.`;
//                 emailHtml = `
//                     <p>Hi ${customerName},</p>
//                     <p>Thank you for your order! We have received order #${orderIdShort} and it is now being processed.</p>
//                     <p>Please keep the exact amount ready for when our delivery partner arrives. We will notify you again once your order has been shipped.</p>
//                     <p>Thank you for shopping with us!</p>
//                 `;
//                 break;

//             default:
//                 webMessage = `Your order #${orderIdShort} has been successfully placed.`;
//                 emailHtml = `
//                     <p>Hi ${customerName},</p>
//                     <p>Thank you for your order! We have received order #${orderIdShort} and it is now being processed.</p>
//                     <p>Thank you for shopping with us!</p>
//                 `;
//                 break;
//         }
        
//         await sendEmail(order.userId.email, emailSubject, emailHtml);

//         const webLink = `/profile/orders/${order._id}`;
//         await createNotification(order.userId._id, webMessage, webLink, 'order');

//     } catch (error) {
//         console.error(`Failed to send 'Order Received' notifications for order ${orderId}:`, error);
//     }
// };


// exports.createOrder = async (req, res) => {
//   try {
//     const order = new Order(req.body);
//     let savedOrder = await order.save();

//     const populatedOrder = await Order.findById(savedOrder._id);
//     if (!populatedOrder) throw new Error("Failed to find order after saving.");
//     for (const item of populatedOrder.items) {
//       const product = await Product.findById(item.productId);
//       if (!product) {
//         console.warn(`Product not found: ${item.productId}`);
//         continue;
//       }

//       if (product.quantity < item.quantity) {
//         return res.status(400).json({
//           error: `Insufficient stock for ${product.name}`,
//         });
//       }

//       product.quantity -= item.quantity;
//       await product.save();
//     }

//     await sendOrderReceivedNotifications(populatedOrder._id);

//     if (populatedOrder.paymentMethod === 'esewa') {
//       const secretKey = process.env.ESEWA_SECRET_KEY;
//       const message = `total_amount=${populatedOrder.totalAmount},transaction_uuid=${populatedOrder._id},product_code=${process.env.ESEWA_MERCHANT_CODE}`;
//       const signature = crypto.createHmac('sha256', secretKey).update(message).digest('base64');

//       const paymentDetails = {
//         amount: populatedOrder.totalAmount - populatedOrder.deliveryFee,
//         tax_amount: 0,
//         total_amount: populatedOrder.totalAmount,
//         transaction_uuid: populatedOrder._id.toString(),
//         product_code: process.env.ESEWA_MERCHANT_CODE,
//         product_service_charge: 0,
//         product_delivery_charge: populatedOrder.deliveryFee,
//         success_url: `${process.env.BASE_URL}/api/payments/esewa/callback`,
//         failure_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-fail?order_id=${populatedOrder._id}`,
//         signed_field_names: "total_amount,transaction_uuid,product_code",
//         signature: signature,
//       };

//       return res.status(201).json({
//         message: 'Order created, redirecting to eSewa.',
//         order: populatedOrder,
//         paymentDetails,
//         paymentGatewayUrl: process.env.ESEWA_API_URL
//       });
//     }

//     if (['cod', 'bank'].includes(populatedOrder.paymentMethod)) {
//       return res.status(201).json({
//         message: 'Order created successfully.',
//         order: populatedOrder,
//         paymentGatewayUrl: null
//       });
//     }

//     return res.status(400).json({ error: 'Invalid payment method.' });

//   } catch (err) {
//     console.error("Order creation failed:", err);
//     return res.status(500).json({ error: err.message });
//   }
// };

// exports.createOrderWithSlip = async (req, res) => {
//   try {
//     const items = JSON.parse(req.body.items);
//     const shippingAddress = JSON.parse(req.body.shippingAddress);
    
//     const orderData = {
//         userId: req.body.userId,
//         items: items,
//         shippingAddress: shippingAddress,
//         deliveryFee: req.body.deliveryFee,
//         totalAmount: req.body.totalAmount,
//         paymentMethod: 'bank',    
//         deliveryType: 'domestic',
//         paymentStatus: 'pending', 
//     };
//     if (req.file) {
//         orderData.slipImageUrl = req.file.path; 
//     } else {
//         return res.status(400).json({ error: "Payment slip image is required." });
//     }
//     const order = new Order(orderData);
//     await order.save();
    
//     res.status(201).json({ 
//         message: 'Order created with payment slip, awaiting verification.', 
//         order: order 
//     });

//   } catch (err) {
//     console.error("Create order with slip failed:", err);
//     return res.status(500).json({ error: "Server error while creating order." });
//   }
// };

// /**
//  * @desc    
//  * @route   
//  * @access 
//  */
// exports.getMyOrderById = async (req, res) => {
//     try {
//         const order = await Order.findById(req.params.id)
//             .populate('items.productId', 'name filepath')
//             .populate('userId', 'fullName email');

//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }
//         if (order.userId._id.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ message: 'Not authorized to view this order.' });
//         }

//         res.json(order);

//     } catch (err) {
//         console.error(`Error fetching user order ${req.params.id}:`, err);
//         res.status(500).json({ error: 'Server error while fetching the order.' });
//     }
// };

// /**
//  * @desc    
//  * @route   
//  * @access  
//  */
// exports.getLastShippingAddress = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     const order = await Order.findOne({ userId: userId }).sort({ createdAt: -1 });

//     if (!order) {
//       return res.status(404).json({ message: "No previous shipping address found." });
//     }
//     res.json(order.shippingAddress);

//   } catch (error) {
//     console.error("Error fetching last shipping address:", error);
//     res.status(500).json({ error: "Server error." });
//   }
// };


































// const Order = require('../mode/OrderModels');
// const Produc = requir('../models/ProductModel');

// exports.createOrder = async (req, res) => {
//   try {
//     const orderData = 
//       ...req.body,
//       userId: re.use._i,
//     };

//     co order = new 6rder(orderData
//     const savedOrde4 = ai order.sav();

//     // Optional: Upd3 product stock
//     f (const item of savedOrder.tems) {
//       con product = await Prod.findById(item.productId);
//       i (product && product.quantity >= item.quantity) {
//         product.qutity -= itm.quantity;
//         await prouct.save();
//       }
//     }

//     return re.status(201).sn({
//       messa: 'Order create3 successfully.',
//       order: savedOrdr,
//     });
//   } catc (er) {
//     console.erro4("Orde creation error:", err);
//     res.status(500).j({ error: err.message })
//   }
// };


















const Order = require('../models/OrderModels');
const Product = require('../models/ProductModel');

exports.createOrder = async (req, res) => {
  try {
    // Explicitly pick required fields from req.body
    const orderData = {
      userId: req.user._id,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phoneNo: req.body.phoneNo,
      city: req.body.city,
      street: req.body.street,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    // Update pro stock quant
    for (const item of savedOrder.items) {
      const product = await Product.findById(item.productId);
      if (product && product.quantity >= item.quantity) {
        product.quantity -= item.quantity;
        await product.save();
      }
    }

    return res.status(201).json({
      message: 'Order created successfully.',
      order: savedOrder,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: err.message });
  }
};






















// // createOrder controller
// const Order = require('../models/OrderModels');
// const Product = require('../models/ProductModel');

// exports.createOrder = async (req, res) => {
//   try {
//     // Construct order data explicitly from request body
//     const orderData = {
//       userId: req.user._id,
//       firstname: req.body.firstname,
//       lastname: req.body.lastname,
//       phoneNo: req.body.phoneNo,
//       city: req.body.city,
//       street: req.body.street,
//       items: req.body.items,
//       totalAmount: req.body.totalAmount,
//     };

//     const order = new Order(orderData);
//     const savedOrder = await order.save();

//     // Update stock quantities for each product in order
//     for (const item of savedOrder.items) {
//       const product = await Product.findById(item.productId);
//       if (product && product.quantity >= item.quantity) {
//         product.quantity -= item.quantity;
//         await product.save();
//       }
//     }

//     return res.status(201).json({
//       message: 'Order created successfully.',
//       order: savedOrder,
//     });
//   } catch (err) {
//     console.error("Order creation error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


















