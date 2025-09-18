const { body, query, param, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  handleValidationErrors
];

// Stock validation rules
const stockValidation = {
  create: [
    body('material_id').isInt({ min: 1 }).withMessage('Material ID is required and must be a positive integer'),
    body('store_id').isInt({ min: 1 }).withMessage('Store ID is required and must be a positive integer'),
    body('qty_on_hand').isFloat({ min: 0 }).withMessage('Quantity on hand must be a non-negative number'),
    body('reorder_level').optional().isFloat({ min: 0 }).withMessage('Reorder level must be a non-negative number'),
    body('low_stock_threshold').optional().isFloat({ min: 0 }).withMessage('Low stock threshold must be a non-negative number'),
    handleValidationErrors
  ],
  
  update: [
    body('qty_on_hand').optional().isFloat({ min: 0 }).withMessage('Quantity on hand must be a non-negative number'),
    body('reorder_level').optional().isFloat({ min: 0 }).withMessage('Reorder level must be a non-negative number'),
    body('low_stock_threshold').optional().isFloat({ min: 0 }).withMessage('Low stock threshold must be a non-negative number'),
    body('low_stock_alert').optional().isBoolean().withMessage('Low stock alert must be a boolean'),
    handleValidationErrors
  ],

  issueMaterials: [
    body('request_id').isInt({ min: 1 }).withMessage('Request ID is required and must be a positive integer'),
    body('items').isArray({ min: 1 }).withMessage('Items array is required and must not be empty'),
    body('items.*.request_item_id').isInt({ min: 1 }).withMessage('Request item ID is required and must be a positive integer'),
    body('items.*.qty_issued').isFloat({ min: 0.01 }).withMessage('Quantity issued must be a positive number'),
    body('items.*.store_id').isInt({ min: 1 }).withMessage('Store ID is required and must be a positive integer'),
    body('items.*.notes').optional().isString().isLength({ max: 500 }).withMessage('Notes must be a string with maximum 500 characters'),
    handleValidationErrors
  ]
};

// Material validation rules
const materialValidation = {
  create: [
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be between 1 and 255 characters'),
    body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be a string with maximum 1000 characters'),
    body('code').optional().isString().isLength({ max: 50 }).withMessage('Code must be a string with maximum 50 characters'),
    body('specifications').optional().isString().isLength({ max: 1000 }).withMessage('Specifications must be a string with maximum 1000 characters'),
    body('category_id').isInt({ min: 1 }).withMessage('Category ID is required and must be a positive integer'),
    body('unit_id').isInt({ min: 1 }).withMessage('Unit ID is required and must be a positive integer'),
    body('unit_price').isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
    handleValidationErrors
  ],

  update: [
    body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
    body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be a string with maximum 1000 characters'),
    body('code').optional().isString().isLength({ max: 50 }).withMessage('Code must be a string with maximum 50 characters'),
    body('specifications').optional().isString().isLength({ max: 1000 }).withMessage('Specifications must be a string with maximum 1000 characters'),
    body('category_id').optional().isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
    body('unit_id').optional().isInt({ min: 1 }).withMessage('Unit ID must be a positive integer'),
    body('unit_price').optional().isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
    handleValidationErrors
  ]
};

// User validation rules
const userValidation = {
  create: [
    body('full_name').trim().isLength({ min: 1, max: 255 }).withMessage('Full name is required and must be between 1 and 255 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().isLength({ max: 20 }).withMessage('Phone must be a string with maximum 20 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('role_id').isInt({ min: 1 }).withMessage('Role ID is required and must be a positive integer'),
    handleValidationErrors
  ],

  update: [
    body('full_name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Full name must be between 1 and 255 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().isString().isLength({ max: 20 }).withMessage('Phone must be a string with maximum 20 characters'),
    body('role_id').optional().isInt({ min: 1 }).withMessage('Role ID must be a positive integer'),
    handleValidationErrors
  ],

  changePassword: [
    body('current_password').isLength({ min: 1 }).withMessage('Current password is required'),
    body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
    handleValidationErrors
  ]
};

// Request validation rules
const requestValidation = {
  create: [
    body('site_id').isInt({ min: 1 }).withMessage('Site ID is required and must be a positive integer'),
    body('notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes must be a string with maximum 1000 characters'),
    body('items').isArray({ min: 1 }).withMessage('Items array is required and must not be empty'),
    body('items.*.material_id').isInt({ min: 1 }).withMessage('Material ID is required and must be a positive integer'),
    body('items.*.qty_requested').isFloat({ min: 0.01 }).withMessage('Quantity requested must be a positive number'),
    handleValidationErrors
  ],

  update: [
    body('site_id').optional().isInt({ min: 1 }).withMessage('Site ID must be a positive integer'),
    body('notes').optional().isString().isLength({ max: 1000 }).withMessage('Notes must be a string with maximum 1000 characters'),
    body('items').optional().isArray({ min: 1 }).withMessage('Items array must not be empty'),
    body('items.*.material_id').optional().isInt({ min: 1 }).withMessage('Material ID must be a positive integer'),
    body('items.*.qty_requested').optional().isFloat({ min: 0.01 }).withMessage('Quantity requested must be a positive number'),
    handleValidationErrors
  ]
};

// Site validation rules
const siteValidation = {
  create: [
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be between 1 and 255 characters'),
    body('location').trim().isLength({ min: 1, max: 255 }).withMessage('Location is required and must be between 1 and 255 characters'),
    handleValidationErrors
  ],

  update: [
    body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
    body('location').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Location must be between 1 and 255 characters'),
    handleValidationErrors
  ]
};

// Store validation rules
const storeValidation = {
  create: [
    body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required and must be between 1 and 255 characters'),
    body('location').trim().isLength({ min: 1, max: 255 }).withMessage('Location is required and must be between 1 and 255 characters'),
    body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be a string with maximum 1000 characters'),
    body('manager_name').optional().isString().isLength({ max: 255 }).withMessage('Manager name must be a string with maximum 255 characters'),
    body('contact_phone').optional().isString().isLength({ max: 20 }).withMessage('Contact phone must be a string with maximum 20 characters'),
    body('contact_email').optional().isEmail().normalizeEmail().withMessage('Valid contact email is required'),
    handleValidationErrors
  ],

  update: [
    body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Name must be between 1 and 255 characters'),
    body('location').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Location must be between 1 and 255 characters'),
    body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be a string with maximum 1000 characters'),
    body('manager_name').optional().isString().isLength({ max: 255 }).withMessage('Manager name must be a string with maximum 255 characters'),
    body('contact_phone').optional().isString().isLength({ max: 20 }).withMessage('Contact phone must be a string with maximum 20 characters'),
    body('contact_email').optional().isEmail().normalizeEmail().withMessage('Valid contact email is required'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  paginationValidation,
  idValidation,
  stockValidation,
  materialValidation,
  userValidation,
  requestValidation,
  siteValidation,
  storeValidation
};
