require("dotenv").config();
const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const User = require("../models/UserModels");
const Category = require("../models/CategoryModel");
const Product = require("../models/ProductModel");
const Order = require("../models/OrderModels");

jest.setTimeout(60000);
let adminToken = "";
let userToken = "";
let userEmail = ""; 

let testAdminId = null;
let testUserId = null;
let testCategoryId = null;
let testProductId = null;
let testOrderId = null;
let bankOrderId = null;

describe("Safe Admin and User Order API Lifecycle", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URL);

        const adminEmail = "safe.order.admin@example.com";
        userEmail = "safe.order.user@example.com"; 
        const categoryName = "Safe Order Test Category";
        const productName = "Safe Order Test Product";

        await User.deleteOne({ email: adminEmail });
        await User.deleteOne({ email: userEmail });
        await Category.deleteOne({ name: categoryName });
        await Product.deleteOne({ name: productName });

        await request(app).post("/api/auth/register").send({
            firstName: 'OrderAdmin', lastName: 'Test', email: adminEmail, password: 'password123', role: 'admin'
        });
        await request(app).post("/api/auth/register").send({
            firstName: 'OrderUser', lastName: 'Test', email: userEmail, password: 'password123'
        });

        const adminLoginRes = await request(app).post("/api/auth/login").send({ email: adminEmail, password: 'password123' });
        adminToken = adminLoginRes.body.token;
        const userLoginRes = await request(app).post("/api/auth/login").send({ email: userEmail, password: 'password123' });
        userToken = userLoginRes.body.token;

        const admin = await User.findOne({ email: adminEmail });
        const user = await User.findOne({ email: userEmail });
        testAdminId = admin._id;
        testUserId = user._id;

        const category = new Category({ name: categoryName, description: 'Category for order test' });
        await category.save();
        testCategoryId = category._id;

        const product = new Product({
            name: productName, description: 'Product for order test', price: 150,
            originalPrice: 200, quantity: 20,
            categoryId: testCategoryId, filepath: 'uploads/fake-path.jpg'
        });
        await product.save();
        testProductId = product._id;
    });

    afterAll(async () => {
        if (testAdminId) await User.findByIdAndDelete(testAdminId);
        if (testUserId) await User.findByIdAndDelete(testUserId);
        if (testCategoryId) await Category.findByIdAndDelete(testCategoryId);
        if (testProductId) await Product.findByIdAndDelete(testProductId);
        if (testOrderId) await Order.findByIdAndDelete(testOrderId);
        if (bankOrderId) await Order.findByIdAndDelete(bankOrderId);

        await mongoose.disconnect();
    });
    test("1. Should fail to get all orders if not authenticated", async () => {
        const res = await request(app).get("/api/admin/order");
        expect(res.statusCode).toBe(403);
    });

    test("2. Should fail if a regular user tries to access the admin 'get all orders' route", async () => {
        const res = await request(app).get("/api/admin/order").set("Authorization", `Bearer ${userToken}`);
        expect(res.statusCode).toBe(403);
    });
    
    test("3. Should fail to create an order with insufficient stock", async () => {
         const orderPayload = { userId: testUserId, items: [{ productId: testProductId, quantity: 999, price: 150 }], totalAmount: 999 * 150, paymentMethod: 'cod', deliveryType: 'domestic', shippingAddress: {} };
         const res = await request(app).post("/api/orders/create").set("Authorization", `Bearer ${userToken}`).send(orderPayload);
         expect(res.statusCode).toBe(400);
         expect(res.body.error).toContain("Insufficient stock");
    });

    test("4. User should CREATE a new 'cod' order successfully", async () => {
        const orderPayload = {
            userId: testUserId,
            items: [{ productId: testProductId, name: "Safe Order Test Product", quantity: 2, price: 150 }],
            shippingAddress: { fullName: "Test User", phone: "9876543210", country: "Testland", district: "Testshire", city: "Testville", addressLine: "123 Test Street", postalCode: "12345"},
            paymentMethod: 'cod', deliveryType: 'domestic', deliveryFee: 5, totalAmount: 305
        };
        const res = await request(app).post("/api/orders/create").set("Authorization", `Bearer ${userToken}`).send(orderPayload);
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Order created successfully.");
        expect(res.body.order).toBeDefined();
        testOrderId = res.body.order._id;
    });

    test("5. User should CREATE a second 'bank' order successfully", async () => {
        const orderPayload = {
            userId: testUserId, items: [{ productId: testProductId, name: "Safe Order Test Product", quantity: 1, price: 150 }],
            shippingAddress: { fullName: "Test User", phone: "9876543210", country: "Testland", district: "Testshire", city: "Testville", addressLine: "123 Test Street", postalCode: "12345" },
            paymentMethod: 'bank', deliveryType: 'domestic', deliveryFee: 5, totalAmount: 155
        };
        const res = await request(app).post("/api/orders/create").set("Authorization", `Bearer ${userToken}`).send(orderPayload);
        expect(res.statusCode).toBe(201);
        bankOrderId = res.body.order._id;
    });

    test("6. User should GET their own order by ID", async () => {
        const res = await request(app).get(`/api/orders/myorders/${testOrderId}`).set("Authorization", `Bearer ${userToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(testOrderId);
    });

    test("7. User should be BLOCKED from getting another user's order", async () => {
        const res = await request(app).get(`/api/admin/order/${testOrderId}`).set("Authorization", `Bearer ${userToken}`);
        expect(res.statusCode).toBe(403);
    });
    
    test("8. User should get their last used shipping address", async () => {
        const res = await request(app).get(`/api/orders/last-shipping/${testUserId}`).set("Authorization", `Bearer ${userToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.city).toBe("Testville");
    });
    
    test("9. Admin should GET ALL orders and find the two new ones", async () => {
        const res = await request(app).get("/api/admin/order").set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        const ids = res.body.map(order => order._id);
        expect(ids).toContain(testOrderId);
        expect(ids).toContain(bankOrderId);
    });
    
    test("10. Admin should GET the newly created order by ID", async () => {
        const res = await request(app).get(`/api/admin/order/${testOrderId}`).set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(testOrderId);
        expect(res.body.userId.email).toBe(userEmail); 
        expect(res.body.deliveryStatus).toBe("pending");
    });

    test("11. Admin should EDIT the order's delivery status to 'shipped'", async () => {
        const res = await request(app).put(`/api/admin/order/${testOrderId}`).set("Authorization", `Bearer ${adminToken}`).send({ deliveryStatus: "shipped" });
        expect(res.statusCode).toBe(200);
        expect(res.body.deliveryStatus).toBe("shipped");
    });
    
    test("12. Admin should EDIT the order's payment status to 'paid'", async () => {
        const res = await request(app).put(`/api/admin/order/${testOrderId}`).set("Authorization", `Bearer ${adminToken}`).send({ paymentStatus: "paid" });
        expect(res.statusCode).toBe(200);
        expect(res.body.paymentStatus).toBe("paid");
    });

    test("13. Admin should EDIT both delivery and payment status to 'delivered'", async () => {
        const res = await request(app).put(`/api/admin/order/${testOrderId}`).set("Authorization", `Bearer ${adminToken}`).send({ deliveryStatus: "delivered" });
        expect(res.statusCode).toBe(200);
        expect(res.body.deliveryStatus).toBe("delivered");
    });
    
    test("14. Admin should fail to EDIT an order with an invalid ID", async () => {
        const invalidId = new mongoose.Types.ObjectId();
        const res = await request(app).put(`/api/admin/order/${invalidId}`).set("Authorization", `Bearer ${adminToken}`).send({ deliveryStatus: "delivered" });
        expect(res.statusCode).toBe(404);
    });
    
    test("15. Product quantity should be reduced after ordering", async () => {
        const product = await Product.findById(testProductId);
        expect(product.quantity).toBe(17);
    });
    
    test("16. Admin should DELETE the main test order successfully", async () => {
        const res = await request(app).delete(`/api/admin/order/${testOrderId}`).set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Order removed successfully");
    });

    test("17. Admin should fail to GET the deleted order", async () => {
        const res = await request(app).get(`/api/admin/order/${testOrderId}`).set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(404);
        testOrderId = null;
    });

    test("18. Admin should still be able to DELETE the second test order", async () => {
        const res = await request(app).delete(`/api/admin/order/${bankOrderId}`).set("Authorization", `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        bankOrderId = null;
    });
});