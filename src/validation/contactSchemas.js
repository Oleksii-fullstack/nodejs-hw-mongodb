import Joi from 'joi';
import { typeList } from '../constants/contactConstants.js';

export const contactAddSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Film name should be a string',
    'string.min': 'Film name should have at least {#limit} characters',
    'string.max': 'Film name should have at most {#limit} characters',
    'any.required': 'Film name is required',
  }),
  phoneNumber: Joi.number().integer().required(),
  email: Joi.string().min(3).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .min(3)
    .max(20)
    .valid(...typeList)
    .required(),
});

export const contactUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.base': 'Film name should be a string',
    'string.min': 'Film name should have at least {#limit} characters',
    'string.max': 'Film name should have at most {#limit} characters',
  }),
  phoneNumber: Joi.number().integer(),
  email: Joi.string().min(3).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .min(3)
    .max(20)
    .valid(...typeList),
});
