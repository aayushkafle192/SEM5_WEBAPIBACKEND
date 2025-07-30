const express = require('express');
const router = express.Router();

const uploader = require('../../middlewares/fileupload'); 
const { authenticateUser, isAdmin } = require('../../middlewares/authorizedUsers');
const {
  getAllOrders,
  getOrderById,
  // uploadBankSlip,
  deleteOrder,
  // editOrder
} = require('../../controllers/admin/ordermanagement');

// router.post('/:id/upload-slip', authenticateUser, uploader.single('slipImage'), uploadBankSlip);
router.get('/', authenticateUser, isAdmin, getAllOrders);
router.get('/:id', authenticateUser, isAdmin, getOrderById);
// router.put('/:id', authenticateUser, isAdmin, editOrder);
router.delete('/:id', authenticateUser, isAdmin, deleteOrder);

module.exports = router;