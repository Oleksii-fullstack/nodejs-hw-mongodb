import createHttpError from 'http-errors';

export const errorHandler = (error, req, res, next) => {
  const { status = 500, message = 'Something went wrong' } = error;

  if (error instanceof createHttpError.HttpError) {
    res.status(status).json({
      status,
      message,
    });
    return;
  }

  res.status(status).json({
    status,
    message,
  });
};
