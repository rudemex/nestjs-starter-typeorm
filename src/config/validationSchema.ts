import Joi from 'joi';
import { validateSchemaForApp } from '@tresdoce-nestjs-toolkit/paas';

import { allowedDbTypes } from '../commons/constants';

export const validationSchema = validateSchemaForApp({
  TEST_KEY: Joi.string().required(),
  RICK_AND_MORTY_API_URL: Joi.string().required(),
  RICK_AND_MORTY_API_URL_LIVENESS: Joi.string().required(),
  DATABASE_TYPE: Joi.string()
    .valid(...allowedDbTypes)
    .required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_DB_NAME: Joi.string().required(),
  DATABASE_DB_SYNC: Joi.boolean().default(false),
  DATABASE_DB_AUTO_LOAD_ENTITIES: Joi.boolean().default(false),
  DATABASE_INSECURE_AUTH: Joi.boolean().default(false),
});
