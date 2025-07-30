const express = require("express");
const router = express.Router();
const productController = require("../../controllers/admin/productmanagement");
const upload = require("../../middlewares/fileupload");
const { authenticateUser, isAdmin } = require("../../middlewares/authorizedUsers");

router.post(
  "/create",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "extraImages", maxCount: 10 }
  ]),
  authenticateUser,
  isAdmin,
  productController.createProduct
);


router.get("/featured", productController.getFeaturedProducts);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);

router.put(
  "/:id",
  authenticateUser,
  isAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "extraImages", maxCount: 10 }
  ]),
  productController.updateProduct
);

router.delete(
  "/:id",
  authenticateUser,
  isAdmin,
  productController.deleteProduct
);

module.exports = router;
