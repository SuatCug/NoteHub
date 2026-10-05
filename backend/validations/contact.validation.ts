import { body } from 'express-validator';

const CONTACT_TOPICS = ['general', 'support', 'copyright', 'privacy', 'feedback'];

const contactRules = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 80 }),
  body('email').trim().toLowerCase().isEmail().withMessage('Please enter a valid email address.'),
  body('topic').isIn(CONTACT_TOPICS).withMessage('Please choose a topic.'),
  body('message')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters.')
    .isLength({ max: 3000 })
    .withMessage('Message can be at most 3000 characters.'),
];

export { contactRules, CONTACT_TOPICS };
