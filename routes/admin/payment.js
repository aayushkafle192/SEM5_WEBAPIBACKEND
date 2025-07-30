const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const Order = require('../../models/OrderModels');

// const { sendEmail } = require('../../services/emailService');
// const { createNotification } = require('../../services/notificationService');
// const { getOrderConfirmationHtml } = require('../../services/emailTemplates'); 

const router = express.Router();

const sendConfirmationNotifications = async (orderId) => {
  try {
    const confirmedOrder = await Order.findById(orderId)
      .populate('userId', 'email fullName')
      .populate('items.productId', 'filepath'); 
    
    if (confirmedOrder) {
      const orderIdShort = confirmedOrder._id.toString().slice(-6);
      
      const emailHtml = getOrderConfirmationHtml(confirmedOrder); 
      const emailSubject = `Order Confirmed - Your ROLO order #${orderIdShort}`;
      await sendEmail(confirmedOrder.userId.email, emailSubject, emailHtml);

      const webMessage = `Payment successful for order #${orderIdShort}.`;
      const webLink = `/profile/orders/${confirmedOrder._id}`;
      await createNotification(confirmedOrder.userId._id, webMessage, webLink);
    }
  } catch (error) {
    console.error(`Failed to send notifications for order ${orderId}:`, error);
  }
};

router.get('/esewa/callback', async (req, res) => {
  try {
    const { data } = req.query;
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

    if (decodedData.status !== 'COMPLETE') {
      return res.redirect(`${process.env.CLIENT_FAILURE_URL}?error=payment_failed`);
    }

    const orderId = decodedData.transaction_uuid;
    const order = await Order.findById(orderId);

    if (order && order.paymentStatus === 'pending') {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid', paymentReferenceId: decodedData.transaction_code });
        await sendConfirmationNotifications(orderId); 
    }
    
    res.redirect(`${process.env.CLIENT_SUCCESS_URL}?verified=true&orderId=${orderId}`);
  } catch (error) {
    console.error("eSewa verification failed:", error);
    res.redirect(`${process.env.CLIENT_FAILURE_URL}?error=server_error`);
  }
});

module.exports = router;