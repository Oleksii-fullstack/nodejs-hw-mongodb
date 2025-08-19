import createHttpError from 'http-errors';

export const validateBody = (schema) => {
  const middleware = async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, {
        abortEarly: false,
      });
      next();
    } catch (error) {
      throw createHttpError(400, error.message);
    }
  };
  return middleware;
};
