const tinycolor = require("tinycolor2");
const Ribbon = require("../../models/RibbonModels");

exports.createRibbon = async (req, res) => {
  try {
    const { label, color } = req.body;

    console.log("Ribbon creation request body:", req.body); 

    const colorHex = tinycolor(color).toHexString();

    if (!tinycolor(color).isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid color name or code"
      });
    }

    const ribbon = new Ribbon({ label, color: colorHex });
    await ribbon.save();

    return res.status(201).json({
      success: true,
      message: "Ribbon created successfully",
      data: ribbon
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


exports.getAllRibbons = async (req, res) => {
  try {
    const ribbons = await Ribbon.find();
    return res.status(200).json({ success: true, data: ribbons });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateRibbon = async (req, res) => {
  try {
    const { label, color } = req.body;

    if (!tinycolor(color).isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid color name or code"
      });
    }

    const updatedRibbon = await Ribbon.findByIdAndUpdate(
      req.params.id,
      { label, color: tinycolor(color).toHexString() },
      { new: true }
    );

    if (!updatedRibbon) {
      return res.status(404).json({ success: false, message: "Ribbon not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Ribbon updated successfully",
      data: updatedRibbon
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getRibbonById = async (req, res) => {
  try {
    const ribbon = await Ribbon.findById(req.params.id);
    if (!ribbon) {
      return res.status(404).json({ success: false, message: "Ribbon not found" });
    }
    return res.status(200).json({ success: true, data: ribbon });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};



exports.deleteRibbon = async (req, res) => {
  try {
    const result = await Ribbon.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Ribbon not found" });
    }

    return res.status(200).json({ success: true, message: "Ribbon deleted successfully" });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
