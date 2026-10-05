import { param } from 'express-validator';

const idParamRules = [param('id').isMongoId().withMessage('Invalid record id.')];

export { idParamRules };
