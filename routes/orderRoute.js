// const express = require('express');
// const router = express.Router();

// const {
//   createOrder,
//   createOrderWithSlip,
//   getMyOrderById,
//   getLastShippingAddress
// } = require('../controllers/orderController');

// const uploader = require('../middlewares/fileupload');
// const { authenticateUser } = require('../middlewares/authorizedUsers');
// router.post('/create', authenticateUser, createOrder);
// // router.post('/create-with-slip', authenticateUser, uploader.single('slipImage'), createOrderWithSlip);
// // router.get('/myorders/:id', authenticateUser, getMyOrderById);
// router.get('/last-shipping/:userId', authenticateUser, getLastShippingAddress);

// module.exports = router;

















// const express = require('express');
// const router = express.Router();

// const { createOrder } = require('../controllers/orderController');
// const { authenticateUser } = require('../middlewares/authorizedUsers');

// router.post('/create', authenticateUser, createOrder);

// module.exports = router;



















const express = require('express');
const router = express.Router();

const { createOrder } = require('../controllers/orderController');
const { authenticateUser } = require('../middlewares/authorizedUsers');

router.post('/create', authenticateUser, createOrder);

module.exports = router;
