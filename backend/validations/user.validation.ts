import { body } from 'express-validator';

const updateProfileRules = [
  body('fullName').optional().trim().notEmpty().withMessage('Full name cannot be empty.').isLength({ max: 80 }),
  body('university').optional().trim().notEmpty().withMessage('University cannot be empty.').isLength({ max: 120 }),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty.').isLength({ max: 120 }),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio can be at most 500 characters.'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
];

export { updateProfileRules, changePasswordRules };
