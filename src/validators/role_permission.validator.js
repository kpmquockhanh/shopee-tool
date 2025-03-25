import Joi from 'joi';

export function validateCreatePermission(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
  });
  return schema.validate(body);
}

export function validateUpdatePermission(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
  });
  return schema.validate(body);
}

export function validateCreateRole(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    permissions: Joi.array(),
  });
  return schema.validate(body);
}

export function validateAssignRole(body) {
  const schema = Joi.object({
    user_id: Joi.string().hex().length(24).required(),
    role_id: Joi.string().hex().length(24).required(),
    action: Joi.string().valid('assign', 'revoke').required(),
  });
  return schema.validate(body);
}

export function validateGetListUsers(query) {
  const schema = Joi.object({
    page: Joi.number(),
    limit: Joi.number(),
  })
  return schema.validate(query)
}
