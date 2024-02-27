const errorHandler = (err, req, res, next) => {
    const messageErrror = err.message;
    // format error
    const error = {
        status: 'Error',
        error: messageErrror
    };
    const status = 400;
    return res.status(status).json(error);
}

module.exports = errorHandler;