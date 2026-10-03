const router = require('express').Router();
const contactController = require('../controllers/contact.controller');
const { optionalAuth } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { contactRules } = require('../validations/contact.validation');

// İletişim formu (anonim ziyaretçilere de açık)
router.post('/', contactRules, validate, optionalAuth, contactController.sendContactMessage);

module.exports = router;
