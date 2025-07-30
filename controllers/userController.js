const User = require("../models/UserModels");
const Order = require('../models/OrderModels');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.registerUser = async (req, res) => {
    const { email, firstName, lastName, password, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            firstName,
            lastName,
            password: hashedPassword,
            role: role || "normal"
        });

        await newUser.save();

        return res.status(201).json({ success: true, message: "User Registered" });
    } catch (err) {
        console.error("🔥 Register error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing field" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(403).json({ success: false, message: "User not found" });

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) return res.status(403).json({ success: false, message: "Invalid credentials" });

        const payload = {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

        return res.status(200).json({ success: true, message: "Login Successful", data: user, token });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.sendResetLink = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "20m" });
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

        const mailOptions = {
            from: `"Your App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset your password",
            html: `<p>Hi ${user.firstName},</p>
                   <p>Click the link below to reset your password:</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>This link expires in 20 minutes.</p>`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("NODEMAILER FAILED:", err);
                return res.status(403).json({ success: false, message: "Email failed to send." });
            }
            console.log("Nodemailer success info:", info);
            return res.status(200).json({ success: true, message: "Reset email sent" });
        });

    } catch (err) {
        console.error("!!! FATAL ERROR IN sendResetLink:", err);
        return res.status(500).json({ success: false, message: "Server error caught." });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashed = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(decoded.id, { password: hashed });

        return res.status(200).json({ success: true, message: "Password updated" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Invalid or expired token" });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        const orders = await Order.find({ userId: req.user._id })
            .populate("items.productId", "name filepath")
            .sort({ createdAt: -1 });

        return res.json({ user, orders });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.email = req.body.email || user.email;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Incorrect current password.' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};
