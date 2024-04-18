import Joi from 'joi';

export function validateGetMessages(body) {
  const schema = Joi.object({
    room_id: Joi.string().hex().length(24).required(),
  });
  return schema.validate(body);
}

export function validateSendMessage(body) {
  const schema = Joi.object({
    content: Joi.string().min(1).required(),
    room_id: Joi.string().hex().length(24).required(),
  });
  return schema.validate(body);
}

export function validateCreateRoom(body) {
  const schema = Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string(),
  });
  return schema.validate(body);
}

export function validateDeleteRoom(body) {
  const schema = Joi.object({
    room_id: Joi.string().min(1).required(),
  });
  return schema.validate(body);
}
