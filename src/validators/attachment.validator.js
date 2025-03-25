import Joi from 'joi';

export const validateCreateAttachment = (body) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    // type: Joi.string().valid('image', 'profile_image', 'preview', 'room_thumbnail').required(),
    public: Joi.boolean(),
  });

  return schema.validate(body);
};

export const validateGetAttachment = (query) => {
  const schema = Joi.object({
    page: Joi.number().min(1),
    limit: Joi.number().min(1),
    type: Joi.string(),
  });

  return schema.validate(query);
};

export const validateDeleteAttachment = (params) => {
  const schema = Joi.object({
    attachment_id: Joi.string().required(),
  });

  return schema.validate(params);
};

export const validateGetUnusedAttachments = (query) => {
  const schema = Joi.object({
    page: Joi.number().min(1),
    limit: Joi.number().min(1),
  });

  return schema.validate(query);
};

export const validateDeleteUnusedAttachments = (body) => {
  const schema = Joi.object({
    ref_id: Joi.string().required(),
  });

  return schema.validate(body);
};

export const validateUpdateVisibility = (body) => {
  const schema = Joi.object({
    public: Joi.boolean().required(),
  });

  return schema.validate(body);
};
