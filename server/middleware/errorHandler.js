const ErrorHandler = (err, req, res, next) => {
    const errStatus = err.statusCode || 500
    const errMsg = err.message || 'Something went wrong'
    const errData = {
        success: false,
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === 'DEV' ? err.stack : {}
    }
    console.error(`${req.method} ${req.originalUrl} - ${errMsg} ${err.stack}`)
    return res.status(errStatus).json(errData)
}

export default ErrorHandler
