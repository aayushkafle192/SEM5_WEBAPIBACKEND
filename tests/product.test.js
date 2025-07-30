require("dotenv").config();
const request = require("supertest");
const app = require("../index"); 
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const User = require("../models/UserModels");
const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel"); 

jest.setTimeout(45000);

let adminToken = "";
let testCategoryId = "";
let standardProductId = ""; 
let featuredProductId = ""; 

const testImagePath = path.join(__dirname, 'test-image.png');

describe("Safe Admin Product API Suite", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URL);

        const testAdminEmail = "safe.product.admin@example.com";
        const testCategoryName = "Safe Test Category";

        await User.deleteOne({ email: testAdminEmail });
        await Category.deleteOne({ name: testCategoryName });

        await request(app).post("/api/auth/register").send({
            firstName: "Safe Product",
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

        const testCategory = new Category({ name: testCategoryName, description: "A safe category for testing" });
        const savedCategory = await testCategory.save();
        testCategoryId = savedCategory._id.toString();

        if (!fs.existsSync(testImagePath)) {
            throw new Error(`Test image not found at ${testImagePath}. Please create this placeholder image.`);
        }
    });

    afterAll(async () => {
        await User.deleteOne({ email: "safe.product.admin@example.com" });
        await Category.deleteOne({ name: "Safe Test Category" });
        if (standardProductId) {
             await Product.findByIdAndDelete(standardProductId);
        }
        if (featuredProductId) {
             await Product.findByIdAndDelete(featuredProductId);
        }

        await mongoose.disconnect();
    });

    test("Should fail to create a product if not authenticated", async () => {
        const res = await request(app)
            .post("/api/admin/product/create")
            .field("name", "Unauthorized Product");
            
        expect(res.statusCode).toBe(403);
    });

    test("Should create a new STANDARD product successfully", async () => {
        const res = await request(app)
            .post("/api/admin/product/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Standard Test Product")
            .field("description", "A standard product for testing.")
            .field("price", 500)
            .field("originalPrice", 600)
            .field("quantity", 20)
            .field("categoryId", testCategoryId)
            .field("featured", false) 
            .attach("image", testImagePath);

        expect(res.statusCode).toBe(201);
        expect(res.body.data.name).toBe("Standard Test Product");
        standardProductId = res.body.data._id;
    });
    
    test("Should create a new FEATURED product successfully", async () => {
        const res = await request(app)
            .post("/api/admin/product/create")
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Featured Test Product")
            .field("description", "A featured product for testing.")
            .field("price", 800)
            .field("originalPrice", 1000)
            .field("quantity", 15)
            .field("categoryId", testCategoryId)
            .field("featured", true) 
            .attach("image", testImagePath);

        expect(res.statusCode).toBe(201);
        expect(res.body.data.name).toBe("Featured Test Product");
        featuredProductId = res.body.data._id; 
    });

    test("Should retrieve ALL products (including the new test ones)", async () => {
        const res = await request(app).get("/api/admin/product");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        const productNames = res.body.data.map(p => p.name);
        expect(productNames).toContain("Standard Test Product");
        expect(productNames).toContain("Featured Test Product");
    });
    
    test("Should retrieve ONLY featured products", async () => {
        const res = await request(app).get("/api/admin/product/featured");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        const productNames = res.body.data.map(p => p.name);
        expect(productNames).toContain("Featured Test Product");
        expect(productNames).not.toContain("Standard Test Product");
    });

    test("Should retrieve a single product by its ID", async () => {
        const res = await request(app).get(`/api/admin/product/${standardProductId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data._id).toBe(standardProductId);
        expect(res.body.data.name).toBe("Standard Test Product");
    });

    test("Should update the standard product successfully", async () => {
        const res = await request(app)
            .put(`/api/admin/product/${standardProductId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .field("name", "Updated Standard Product")
            .field("price", 450)
            .field("originalPrice", 600)
            .field("quantity", 18)
            .field("categoryId", testCategoryId)
            .field("description", "An updated description.");

        expect(res.statusCode).toBe(200);
        expect(res.body.data.name).toBe("Updated Standard Product");
        expect(res.body.data.price).toBe(450);
    });

    test("Should delete the standard product successfully", async () => {
        const res = await request(app)
            .delete(`/api/admin/product/${standardProductId}`)
            .set("Authorization", `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Product deleted successfully");
        standardProductId = null; 
    });

    test("Should fail to retrieve the deleted product", async () => {
        const res = await request(app).get(`/api/admin/product/${standardProductId}`);
        expect(res.statusCode).toBe(500);
    });
});