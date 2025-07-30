const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser,
    sendResetLink,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    changePassword
} = require('../controllers/userController');

const { authenticateUser } = require('../middlewares/authorizedUsers');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-reset-link', sendResetLink);
router.post('/reset-password/:token', resetPassword);

router.route('/profile')
    .get(authenticateUser, getUserProfile)
    .put(authenticateUser, updateUserProfile);

router.put('/profile/change-password', authenticateUser, changePassword);

module.exports = router;