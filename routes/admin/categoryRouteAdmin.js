const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/categorymanagement');
const upload = require("../../middlewares/fileupload")

router.post(
    '/create', 
    upload.single("image"),
    categoryController.createCategory
);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', 
    upload.single("image"),
    categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;