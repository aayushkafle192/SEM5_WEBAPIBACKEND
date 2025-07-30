// const crypto = require('crypto');
// const Order = require('../../models/OrderModels');
// const { sendEmail } = require('../../services/emailService');
// const { createNotification } = require('../../services/notificationService');
// const { getOrderConfirmationHtml } = require('../../services/emailTemplates');

// const sendOrderReceivedNotifications = async (orderId) => {};
// const sendPaymentConfirmedNotifications = async (orderId) => {};

// exports.getAllOrders = async (req, res) => {
//     try {
//         const orders = await Order.find({})
//             .populate('items.productId', 'name filepath')
//             .populate('userId', 'firstName lastName email') 
//             .sort({ createdAt: -1 });
//         res.json(orders);
//     } catch (err) {
//         res.status(500).json({ error: 'Server error while fetching orders.' });
//     }
// };
// exports.getOrdersByUser = async (req, res) => {};
// exports.getOrderById = async (req, res) => {
//      try {
//         const order = await Order.findById(req.params.id)
//             .populate('items.productId', 'name filepath')
//             .populate('userId', 'firstName lastName email'); 
//         if (order) {
//             res.json(order);
//         } else {
//             res.status(404).json({ message: 'Order not found' });
//         }
//     } catch (err) {
//         res.status(500).json({ error: 'Server error while fetching order.' });
//     }
// };
// exports.updateOrderStatus = async (req, res) => {};
// exports.uploadBankSlip = async (req, res) => {};

// /**
//  * @desc  
//  * @route   
//  * @access  
//  */
// exports.deleteOrder = async (req, res) => {
//     try {
//         const order = await Order.findByIdAndDelete(req.params.id);

//         if (order) {
//             res.json({ message: 'Order removed successfully' });
//         } else {
//             res.status(404).json({ message: 'Order not found' });
//         }
//     } catch (err) {
//         console.error("Error deleting order:", err);
//         res.status(500).json({ error: 'Server error while deleting order.' });
//     }
// };

// /**
//  * @desc  
//  * @route  
//  * @access  
//  */
// exports.editOrder = async (req, res) => {
//     try {
//         const originalOrder = await Order.findById(req.params.id);
//         if (!originalOrder) {
//             return res.status(404).json({ error: 'Order not found' });
//         }

//         const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
//             .populate('userId', 'firstName lastName email') 
//             .populate('items.productId', 'name filepath');

//         const { paymentStatus, deliveryStatus } = updatedOrder;

//         if (paymentStatus === 'paid' && originalOrder.paymentStatus === 'pending') {
//             await sendPaymentConfirmedNotifications(updatedOrder._id);
//         }

//         if (deliveryStatus && deliveryStatus !== originalOrder.deliveryStatus) {
//             const orderIdShort = updatedOrder._id.toString().slice(-6);
//             const customerName = updatedOrder.userId.firstName || updatedOrder.shippingAddress.firstName;

//             if (deliveryStatus === 'shipped') {
//                 await sendEmail(updatedOrder.userId.email, `Your ROLO order #${orderIdShort} has shipped!`, `<p>Good news, ${customerName}! Your order is on its way.</p>`);
//                 await createNotification(updatedOrder.userId._id, `Your order #${orderIdShort} has shipped.`, `/profile/orders/${updatedOrder._id}`);
//             } else if (deliveryStatus === 'delivered') {
//                 await sendEmail(updatedOrder.userId.email, `Your ROLO order #${orderIdShort} has been delivered!`, `<p>Hi ${customerName}, your order has been delivered.</p>`);
//                 await createNotification(updatedOrder.userId._id, `Your order #${orderIdShort} was delivered.`, `/profile/orders/${updatedOrder._id}`);
//             }
//         }
        
//         res.json(updatedOrder);

//     } catch (err) {
//         console.error("Error editing order:", err);
//         res.status(400).json({ error: err.message });
//     }
// };











const Order = require('../../models/OrderModels');
const Product = require('../../models/ProductModel');

// ✅ Get all orders (for admin or backend dashboard)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('items.productId', 'name filepath')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching orders.' });
  }
};

// ✅ Get all orders for a specific user
exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('items.productId', 'name filepath')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ error: 'Server error while fetching user orders.' });
  }
};

// ✅ Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name filepath')
      .populate('userId', 'firstName lastName email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching order.' });
  }
};

// ✅ Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (order) {
      res.json({ message: 'Order removed successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: 'Server error while deleting order.' });
  }
};
