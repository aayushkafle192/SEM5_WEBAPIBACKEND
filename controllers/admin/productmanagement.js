const Product = require("../../models/ProductModel");

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      quantity,
      featured,
      categoryId,
      ribbonId,
      material,
      origin,
      care,
      warranty
    } = req.body;

    console.log("--- createProduct Controller ---");
  console.log("Request Body:", req.body);
  console.log("Request Files:", req.files);
  console.log("------------------------------");

    let features = [];
    if (req.body.features) {
      try {
        features = JSON.parse(req.body.features);
      } catch {
        features = [];
      }
    }

    let extraImages = [];
    if (req.files && req.files.extraImages) {
      extraImages = req.files.extraImages.map(file => file.path);
    }

    const filepath = req.files && req.files.image && req.files.image.length > 0
      ? req.files.image[0].path
      : null;

    const youSave = originalPrice - price;
    const discountPercent = Math.round((youSave / originalPrice) * 100);

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      discountPercent,
      youSave,
      quantity,
      filepath,
      featured: featured === 'true', 
      categoryId,
      ribbonId: ribbonId || null,
      extraImages,
      features,
      material: material || "",
      origin: origin || "",
      care: care || "",
      warranty: warranty || ""
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });

  } catch (err) {
    console.error("Product create error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      quantity,
      featured,
      categoryId,
      ribbonId,
      material,
      origin,
      care,
      warranty,
    } = req.body;

    let features = [];
    if (req.body.features) {
      try {
        features = JSON.parse(req.body.features);
      } catch {
        features = [];
      }
    }

    let extraImages = [];
    if (req.files && req.files.extraImages) {
      extraImages = req.files.extraImages.map(file => file.path);
    } else if (req.body.extraImages) {
      try {
        extraImages = JSON.parse(req.body.extraImages);
      } catch {
        extraImages = Array.isArray(req.body.extraImages)
          ? req.body.extraImages
          : [];
      }
    }

    const updateData = {
      name,
      description,
      price,
      originalPrice,
      youSave: originalPrice - price,
      discountPercent: Math.round(((originalPrice - price) / originalPrice) * 100),
      quantity,
      featured: featured === 'true',
      categoryId,
      ribbonId: ribbonId || null,
      extraImages,
      features,
      material: material || "",
      origin: origin || "",
      care: care || "",
      warranty: warranty || ""
    };

    // Only update main image if a new one was uploaded
    if (req.files && req.files.image && req.files.image.length > 0) {
      updateData.filepath = req.files.image[0].path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });

  } catch (err) {
    console.error("Product update error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "name")
      .populate("ribbonId", "label color");
    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("categoryId", "name")
      .populate("ribbonId", "label color");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true })
      .populate("categoryId", "name")
      .populate("ribbonId", "label color");
    return res.status(200).json({ success: true, data: featuredProducts });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, message: "Product deleted successfully" });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
