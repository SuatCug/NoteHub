const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerRules, loginRules, verifyEmailRules } = require('../validations/auth.validation');

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.get('/me', authenticate, authController.me);
router.post('/verify-email', verifyEmailRules, validate, authController.verifyEmail);
router.post('/resend-verification', authenticate, authController.resendVerification);

module.exports = router;
