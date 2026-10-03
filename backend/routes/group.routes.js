const router = require('express').Router();
const groupController = require('../controllers/group.controller');
const authenticate = require('../middlewares/auth.middleware');
const { optionalAuth } = require('../middlewares/auth.middleware');
const requireVerified = require('../middlewares/verified.middleware');
const validate = require('../middlewares/validate.middleware');
const { idParamRules } = require('../validations/common.validation');
const {
  createGroupRules,
  updateGroupRules,
  memberParamRules,
  messageRules,
  messageParamRules,
} = require('../validations/group.validation');

const verifiedOnly = [authenticate, requireVerified];

// Listeleme (anonim ziyaretçilere açık) ve kullanıcının kendi grupları
router.get('/', optionalAuth, groupController.searchGroups);
router.get('/mine', authenticate, groupController.getMyGroups);
router.get('/:id', idParamRules, validate, optionalAuth, groupController.getGroup);
router.get('/:id/members', idParamRules, validate, optionalAuth, groupController.getMembers);
router.get('/:id/notes', idParamRules, validate, optionalAuth, groupController.getGroupNotes);

// Grup kurma / düzenleme / silme (düzenleme ve silme sadece kurucu)
router.post('/', verifiedOnly, createGroupRules, validate, groupController.createGroup);
router.patch('/:id', idParamRules, updateGroupRules, validate, verifiedOnly, groupController.updateGroup);
router.delete('/:id', idParamRules, validate, authenticate, groupController.deleteGroup);

// Katılma / ayrılma (özel grupta katılma = istek gönderme, ayrılma = isteği geri çekme)
router.post('/:id/join', idParamRules, validate, verifiedOnly, groupController.joinGroup);
router.delete('/:id/join', idParamRules, validate, authenticate, groupController.leaveGroup);

// Üye yönetimi (sadece kurucu)
router.delete('/:id/members/:userId', idParamRules, memberParamRules, validate, authenticate, groupController.removeMember);
router.post('/:id/owner/:userId', idParamRules, memberParamRules, validate, authenticate, groupController.transferOwnership);

// Özel grup katılma istekleri (sadece kurucu)
router.get('/:id/requests', idParamRules, validate, authenticate, groupController.getJoinRequests);
router.post('/:id/requests/:userId', idParamRules, memberParamRules, validate, authenticate, groupController.approveJoinRequest);
router.delete('/:id/requests/:userId', idParamRules, memberParamRules, validate, authenticate, groupController.rejectJoinRequest);

// Grup sohbeti (sadece üyeler)
router.get('/:id/messages', idParamRules, validate, authenticate, groupController.getMessages);
router.post('/:id/messages', idParamRules, messageRules, validate, verifiedOnly, groupController.sendMessage);
router.delete(
  '/:id/messages/:messageId',
  idParamRules,
  messageParamRules,
  validate,
  authenticate,
  groupController.deleteMessage
);

module.exports = router;
