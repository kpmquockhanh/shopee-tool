import Joi from 'joi';

export function validateInviteFriend(body) {
  const schema = Joi.object({
    target: Joi.string().hex().length(24).required(),
  });
  return schema.validate(body);
}

export function validateAcceptFriend(body) {
  const schema = Joi.object({
    id: Joi.string().hex().length(24).required(),
  });
  return schema.validate(body);
}

export function validateDeclineFriend(body) {
  const schema = Joi.object({
    id: Joi.string().hex().length(24).required(),
  });
  return schema.validate(body);
}

export function validateFindFriends(body) {
  const schema = Joi.object({
    q: Joi.string().min(5).required(),
    page: Joi.number(),
    limit: Joi.number(),
  });
  return schema.validate(body);
}
