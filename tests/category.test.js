require("dotenv").config();
const request = require("supertest");
const app = require("../index"); 
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const User = require("../models/UserModels");
const Category = require("../models/CategoryModel");

jest.setTimeout(40000); 
let adminToken = "";
let testCategoryId = null; 
const testImagePath = path.join(__dirname, 'test-image.png');

describe("Safe Admin Category API Lifecycle", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URL);

        const testAdminEmail = "safe.category.admin@example.com";
        const testCategoryName = "Temporary Lifecycle Category";

        await User.deleteOne({ email: testAdminEmail });
        await Category.deleteOne({ name: testCategoryName });
        await Category.deleteOne({ name: "Updated Lifecycle Category" }); 

        await request(app).post("/api/auth/register").send({
            firstName: "Category",
            lastName: "Tester",
            email: testAdminEmail,
            password: "password123",
            role: "admin",
        });

        const loginRes = await request(app).post("/api/auth/login").send({
            email: testAdminEmail,
            password: "password123",
        });
        adminToken = loginRes.body.token;

        if (!fs.existsSync(testImagePath)) {
            throw new Error(`Test image not found at ${testImagePath}. Please create this placeholder image.`);
        }
    });

    afterAll(async () => {
        await User.deleteOne({ email: "safe.category.admin@example.com" });
        
        if (testCategoryId) {
             await Category.findByIdAndDelete(testCategoryId);
        }

        await mongoose.disconnect();
    });


    test("Should CREATE a new category with an image", async () => {
        const res = await request(app)
            .post("/api/admin/category/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Temporary Lifecycle Category")
            .attach("image", testImagePath); 

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Temporary Lifecycle Category");
        expect(res.body.data.filepath).toBeDefined();

        testCategoryId = res.body.data._id;
        expect(testCategoryId).toBeDefined();
    });

    test("Should GET ALL categories and find the new one", async () => {
        const res = await request(app)
            .get("/api/admin/category")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        
        const ourCategory = res.body.data.find(cat => cat._id === testCategoryId);
        expect(ourCategory).toBeDefined();
        expect(ourCategory.name).toBe("Temporary Lifecycle Category");
    });
    
    test("Should GET a single category BY ID", async () => {
        const res = await request(app)
            .get(`/api/admin/category/${testCategoryId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(testCategoryId);
    });

    test("Should UPDATE the category's name", async () => {
        const res = await request(app)
            .put(`/api/admin/category/${testCategoryId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Updated Lifecycle Category"); 

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Updated Lifecycle Category");
    });

    test("Should DELETE the category successfully", async () => {
        const res = await request(app)
            .delete(`/api/admin/category/${testCategoryId}`) 
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Category deleted");

        const verifyRes = await request(app)
            .get(`/api/admin/category/${testCategoryId}`)
            .set("Authorization", `Bearer ${adminToken}`);
        
        expect(verifyRes.statusCode).toBe(404);
        testCategoryId = null; 
    });
});