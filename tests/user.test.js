require("dotenv").config();
const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");

// Import necessary models
const User = require("../models/UserModels");

jest.setTimeout(45000);

// --- Global variables to store state ONLY for this test suite ---
let adminToken = ""; // For admin actions
let targetUserToken = ""; // For regular user actions
let targetUserId = null; // ID of the user being managed

// --- Main Test Suite ---
describe("Comprehensive and Safe User API Lifecycle", () => {
    // =================================================================
    // SETUP: Runs once before all tests.
    // =================================================================
    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URL);

        const adminEmail = "safe.user.admin@example.com";
        const targetEmail = "safe.user.target@example.com";

        // --- SAFE CLEANUP using deleteOne for any data from a previously FAILED run ---
        await User.deleteOne({ email: adminEmail });
        await User.deleteOne({ email: targetEmail });
        
        // --- Create Master Admin User via API to get a token for admin tests ---
        await request(app).post("/api/auth/register").send({
            firstName: 'Master', lastName: 'Admin', email: adminEmail, password: 'password123', role: 'admin'
        });
        const loginRes = await request(app).post("/api/auth/login").send({ email: adminEmail, password: 'password123' });
        adminToken = loginRes.body.token;
    });

    // =================================================================
    // TEARDOWN: Runs once after all tests. Safely removes all created data.
    // =================================================================
    afterAll(async () => {
        // --- STRICT SAFE TEARDOWN ---
        await User.deleteOne({ email: "safe.user.admin@example.com" });
        // Failsafe cleanup in case the delete test failed
        if (targetUserId) {
            await User.findByIdAndDelete(targetUserId);
        }
        await mongoose.disconnect();
    });

    // =================================================================
    // THE TESTS (15 TOTAL)
    // =================================================================

    describe("User Registration", () => {
        test("1. Should fail to register a user with missing fields", async () => {
            const res = await request(app).post("/api/auth/register").send({ firstName: "Test" });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Missing fields");
        });

        test("2. Should register a new target user successfully", async () => {
            const res = await request(app).post("/api/auth/register").send({
                firstName: "Target", lastName: "User", email: "safe.user.target@example.com", password: "password123"
            });
            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe("User Registered");
        });

        test("3. Should fail to register a user with a duplicate email", async () => {
            const res = await request(app).post("/api/auth/register").send({
                firstName: "Duplicate", lastName: "Test", email: "safe.user.target@example.com", password: "password123"
            });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("User exists");
        });
    });

    describe("User Login and Authentication", () => {
        test("4. Should fail to log in with a wrong password", async () => {
            const res = await request(app).post("/api/auth/login").send({ email: "safe.user.target@example.com", password: "wrongpassword" });
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("Invalid credentials");
        });

        test("5. Should fail to log in with a non-existent email", async () => {
            const res = await request(app).post("/api/auth/login").send({ email: "nosuchuser@example.com", password: "password123" });
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("User not found");
        });
        
        test("6. Should log in the existing target user successfully", async () => {
            const res = await request(app).post("/api/auth/login").send({ email: "safe.user.target@example.com", password: "password123" });
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            targetUserToken = res.body.token; // Save token for protected routes
            targetUserId = res.body.data._id; // Save ID for direct management
        });
    });

    describe("User Profile Management (as a logged-in user)", () => {
        test("7. Should fail to get user profile if not authenticated", async () => {
            const res = await request(app).get("/api/auth/profile");
            expect(res.statusCode).toBe(403);
        });

        test("8. Should get own user profile successfully", async () => {
            const res = await request(app).get("/api/auth/profile").set("Authorization", `Bearer ${targetUserToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.user._id).toBe(targetUserId);
        });

        test("9. Should update own user profile successfully", async () => {
            const res = await request(app).put("/api/auth/profile").set("Authorization", `Bearer ${targetUserToken}`).send({
                firstName: "UpdatedFirst", lastName: "UpdatedLast"
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.firstName).toBe("UpdatedFirst");
        });
        
        test("10. Should change own password successfully", async () => {
            const res = await request(app).put("/api/auth/profile/change-password").set("Authorization", `Bearer ${targetUserToken}`).send({
                currentPassword: "password123", newPassword: "newpassword456"
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Password changed successfully.");
        });
    });

    describe("Admin User Management (as an admin)", () => {
        test("11. Admin should GET all users", async () => {
            const res = await request(app).get("/api/admin/user").set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            const emails = res.body.data.map(u => u.email);
            expect(emails).toContain("safe.user.target@example.com");
        });

        test("12. Admin should GET a specific user by ID", async () => {
            const res = await request(app).get(`/api/admin/user/${targetUserId}`).set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.data._id).toBe(targetUserId);
        });

        test("13. Admin should UPDATE a specific user's info", async () => {
            const res = await request(app).put(`/api/admin/user/${targetUserId}`).set("Authorization", `Bearer ${adminToken}`).send({
                firstName: "AdminUpdated"
            });
            expect(res.statusCode).toBe(200);
            const user = await User.findById(targetUserId);
            expect(user.firstName).toBe("AdminUpdated");
        });

        test("14. Admin should DELETE the target user successfully", async () => {
            const res = await request(app).delete(`/api/admin/user/${targetUserId}`).set("Authorization", `Bearer ${adminToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("User Deleted");
        });
    });
});