// Central error handler - must be registered after all routes
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    status = 400;
    message = 'Duplicate value: record already exists';
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;
