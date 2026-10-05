const { param } = require('express-validator');

const idParamRules = [param('id').isMongoId().withMessage('Invalid record id.')];

module.exports = { idParamRules };
