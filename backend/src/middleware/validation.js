const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers')
    .trim()
    .toLowerCase(),
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array().map(err => err.msg)
      });
    }
    next();
  }
];

const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim()
    .toLowerCase(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array().map(err => err.msg)
      });
    }
    next();
  }
];

const validateTask = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array().map(err => err.msg)
      });
    }
    
    // Custom validation: at least one field must be provided for updates
    const { title, description, completed } = req.body;
    if (title === undefined && description === undefined && completed === undefined) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: ['At least one field (title, description, or completed) must be provided']
      });
    }
    
    next();
  }
];

const validateTaskCreate = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array().map(err => err.msg)
      });
    }
    next();
  }
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateTask
};