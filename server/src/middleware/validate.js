import { validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.array().map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }
  return next();
};

export default validate;
