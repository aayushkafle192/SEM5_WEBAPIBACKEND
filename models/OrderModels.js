// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User',
//   },
//   items: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
//       name: String,
//       quantity: Number,
//       price: Number,
//     }
//   ],
//   shippingAddress: {
//     fullName: String,
//     phone: String,
//     country: String,
//     district: String, 
//     city: String,
//     addressLine: String,
//     postalCode: String,
//     notes: String,  
//   },
//   paymentMethod: {
//     type: String,
//     enum: ['cod', 'esewa', 'khalti', 'paypal', 'stripe', 'bank', 'credit_card', 'debit_card'],
//     required: true
//   },
//   paymentBankName: {
//     type: String,
//     default: ''
//   },
//   paymentReferenceId: {
//     type: String,
//     default: ''
//   },
//   slipImageUrl: {
//     type: String,
//     default: ''
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['pending', 'paid', 'failed'],
//     default: 'pending'
//   },
//   deliveryStatus: {
//     type: String,
//     enum: ['pending', 'shipped', 'delivered', 'cancelled'],
//     default: 'pending'
//   },
//   deliveryType: {
//     type: String,
//     enum: ['domestic', 'international'],
//     required: true
//   },
//   deliveryFee: {
//     type: Number,
//     default: 0
//   },
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Order', orderSchema);





















// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User',
//   },
//   items: [
//     {
//       productId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Product',
//         required: true,
//       },
//       name: String,
//       quantity: Number,
//       price: Number,
//     }
//   ],
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Order', orderSchema);






















// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User',
//   },
//   firstname: {
//     type: String,
//     required: true,
//   },
//   lastname: {
//     type: String,
//     required: true,
//   },
//   phoneNo: {
//     type: String,
//     required: true,
//   },
//   city: {
//     type: String,
//     required: true,
//   },
//   street: {
//     type: String,
//     required: true,
//   },
//   items: [
//     {
//       productId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Product',
//         required: true,
//       },
//       name: String,
//       quantity: Number,
//       price: Number,
//     }
//   ],
//   totalAmount: {
//     type: Number,
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Order', orderSchema);





















// Order model
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: String,
      quantity: Number,
      price: Number,
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
