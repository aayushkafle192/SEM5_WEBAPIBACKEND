const Category = require('../../models/CategoryModel');

exports.createCategory = async (req, res) => {
    try {
        const filename = req.file?.path

        const category = new Category({ name: req.body.name, filepath: filename });
        await category.save();
        return res.status(201).json({
            success: true,
            message: "Created",
            data: category
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return res.json({ success: true, data: categories, message: "All category" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        return res.json({ success: true, data: category, message: "One category" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const filename = req.file?.path
        const data = {
            name: req.body.name
        }
        if(filename){
            data.filepath = filename
        }
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true }
        );
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        return res.json({ success: true, data: category, message: "Updated" });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Server Error" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const result = await Category.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: 'Category not found' });
        return res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};