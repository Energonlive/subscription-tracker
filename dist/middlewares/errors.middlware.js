const errorMiddleware = (err, req, res, next) => {
    const error = { ...err };
    error.message = err.message;
    console.log('Error:', err);
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        error.statusCode = 404;
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0];
        error.message = field ? `${field} already exists`
            : 'Duplicate field entered';
        error.statusCode = 409;
    }
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors || {}).map((val) => ({
            field: val.path,
            message: val.message
        }));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};
export default errorMiddleware;
