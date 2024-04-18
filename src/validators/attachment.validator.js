import Joi from 'joi';

export function validateGetAttachment(body) {
  const schema = Joi.object({
    page: Joi.number(),
    limit: Joi.number(),
  });
  return schema.validate(body);
}

export function validateCreateAttachment(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    // createdBy: Joi.string().required(),
    // src: Joi.string().required(),
    // type: Joi.string().valid('image').required(),
  });
  return schema.validate(body);
}

export function validateDeleteAttachment(params) {
  const schema = Joi.object({
    attachment_id: Joi.string().required(),
  });
  return schema.validate(params);
}
