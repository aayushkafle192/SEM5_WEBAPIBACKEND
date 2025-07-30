const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true }, 
        originalPrice: { type: Number, required: true }, 
        discountPercent: { type: Number },
        youSave: { type: Number },
        quantity: { type: Number, required: true },
        
        filepath: { type: String, required: true }, 
        
        extraImages: [{ type: String }],
        features: [{ type: String }],
        material: { type: String, default: "" },
        origin: { type: String, default: "" },
        care: { type: String, default: "" },
        warranty: { type: String, default: "" },
        
        featured: { type: Boolean, default: false },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        ribbonId: { type: mongoose.Schema.Types.ObjectId, ref: "Ribbon", default: null }
    }, 
    { 
        timestamps: true 
    }
);

module.exports = mongoose.model("Product", ProductSchema);