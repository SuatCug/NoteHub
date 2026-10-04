const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');
const { optionalAuth } = require('../middlewares/auth.middleware');
const requireVerified = require('../middlewares/verified.middleware');
const validate = require('../middlewares/validate.middleware');
const { uploadAvatar } = require('../middlewares/upload.middleware');
const { idParamRules } = require('../validations/common.validation');
const { updateProfileRules, changePasswordRules } = require('../validations/user.validation');

// Kendi hesabı
router.patch('/me', authenticate, updateProfileRules, validate, userController.updateProfile);
router.put('/me/avatar', authenticate, uploadAvatar, userController.updateAvatar);
router.patch('/me/password', authenticate, changePasswordRules, validate, userController.changePassword);

// Herkese açık profiller (/search, /:id'den önce tanımlanmalı)
router.get('/search', optionalAuth, userController.searchUsers);
router.get('/active', authenticate, userController.getActiveUsers);
router.get('/suggestions', authenticate, userController.getSuggestions);
router.get('/:id', idParamRules, validate, optionalAuth, userController.getProfile);
router.get('/:id/notes', idParamRules, validate, optionalAuth, userController.getUserNotes);
router.get('/:id/followers', idParamRules, validate, userController.getFollowers);
router.get('/:id/following', idParamRules, validate, userController.getFollowing);

// Takip sistemi (sadece doğrulanmış kullanıcılar)
router.post('/:id/follow', idParamRules, validate, authenticate, requireVerified, userController.follow);
router.delete('/:id/follow', idParamRules, validate, authenticate, requireVerified, userController.unfollow);

// Engelleme
router.post('/:id/block', idParamRules, validate, authenticate, userController.block);
router.delete('/:id/block', idParamRules, validate, authenticate, userController.unblock);

module.exports = router;
