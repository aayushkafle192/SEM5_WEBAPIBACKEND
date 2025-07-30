const express = require('express');
const router = express.Router();
const ribbonController = require('../../controllers/admin/ribbonManagement');

router.post('/create', ribbonController.createRibbon);
router.get('/', ribbonController.getAllRibbons);
router.put('/:id', ribbonController.updateRibbon);
router.get('/:id', ribbonController.getRibbonById);
router.delete('/:id', ribbonController.deleteRibbon);

module.exports = router;
