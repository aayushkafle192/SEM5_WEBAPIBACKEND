require("dotenv").config();
const request = require("supertest");
const app = require("../index"); 
const mongoose = require("mongoose");
const User = require("../models/UserModels");
const Ribbon = require("../models/RibbonModels");

jest.setTimeout(30000);

let adminToken = ""; 
let testRibbonId = null; 
describe("Safe Admin Ribbon API Lifecycle", () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.DB_URL);

        const testAdminEmail = "safe.ribbon.admin@example.com";
        const testRibbonLabel = "Temporary Test Ribbon";

        await User.deleteOne({ email: testAdminEmail });
        await Ribbon.deleteOne({ label: testRibbonLabel });
        await Ribbon.deleteOne({ label: "Updated Test Ribbon" }); 
        await request(app).post("/api/auth/register").send({
            firstName: "Ribbon",
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
    });

    afterAll(async () => {
        await User.deleteOne({ email: "safe.ribbon.admin@example.com" });
        
        if (testRibbonId) {
             await Ribbon.findByIdAndDelete(testRibbonId);
        }

        await mongoose.disconnect();
    });

    test("Should CREATE a new ribbon successfully", async () => {
        const res = await request(app)
            .post("/api/admin/ribbon/create")
            .send({
                label: "Temporary Test Ribbon",
                color: "blue" 
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.label).toBe("Temporary Test Ribbon");
        expect(res.body.data.color).toBe("#0000ff"); 
        testRibbonId = res.body.data._id;
        expect(testRibbonId).toBeDefined();
    });

    test("Should fail to create a ribbon with an invalid color", async () => {
        const res = await request(app)
            .post("/api/admin/ribbon/create")
            .send({
                label: "Bad Color Ribbon",
                color: "invalid-color-name"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Invalid color name or code");
    });

    test("Should GET ALL ribbons and find the new one", async () => {
        const res = await request(app).get("/api/admin/ribbon");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        
        const ourRibbon = res.body.data.find(r => r._id === testRibbonId);
        expect(ourRibbon).toBeDefined();
        expect(ourRibbon.label).toBe("Temporary Test Ribbon");
    });
    
    test("Should GET a single ribbon BY ID", async () => {
        const res = await request(app).get(`/api/admin/ribbon/${testRibbonId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(testRibbonId);
    });

    test("Should UPDATE the ribbon's label and color", async () => {
        const res = await request(app)
            .put(`/api/admin/ribbon/${testRibbonId}`)
            .send({
                label: "Updated Test Ribbon",
                color: "#FF0000" 
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.label).toBe("Updated Test Ribbon");
        expect(res.body.data.color).toBe("#ff0000");
    });

    test("Should DELETE the ribbon successfully", async () => {
        const res = await request(app)
            .delete(`/api/admin/ribbon/${testRibbonId}`); 

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Ribbon deleted successfully");
        const verifyRes = await request(app).get(`/api/admin/ribbon/${testRibbonId}`);
        expect(verifyRes.statusCode).toBe(404);
        testRibbonId = null; 
    });
});