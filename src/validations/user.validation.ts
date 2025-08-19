import Joi from 'joi';
import { Types } from 'mongoose';

export const createUser = {
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    fieldOfStudy: Joi.string().allow('', null),
    skills: Joi.array().items(Joi.string()).default([]),
    workExperiences: Joi.array().items(
      Joi.object({
        company: Joi.string().required(),
        position: Joi.string().required(),
        skillsUsed: Joi.array().items(Joi.string()).default([]),
      })
    ).default([]),
    role: Joi.string().valid('admin', 'team_leader', 'member', 'forum_leader').default('member'),
    profileImage: Joi.string().uri().allow('', null),
    teams: Joi.array().items(Joi.string().custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')).default([]),
  }),
};
