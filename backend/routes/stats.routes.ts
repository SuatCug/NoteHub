const router = require('express').Router();
const statsController = require('../controllers/stats.controller');

// Genel platform sayaçları (anonim ziyaretçilere açık)
router.get('/', statsController.getStats);

module.exports = router;
