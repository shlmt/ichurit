
const logger = (req, res, next) => {
  const currentTime = Date.now();

  const originalSend = res.send;

  res.send = (body) => {
    const responseTime = Date.now() - currentTime;

    console.log(
      `-------------
      Request Info:
      Method: ${req.method}
      Path: ${req.originalUrl}
      Body: ${JSON.stringify(req.body || {})}
      Response Info:
      Status: ${res.statusCode}
      Response Time: ${responseTime}ms`
    );

    originalSend.apply(res, [body]);
  };

  next();
};

module.exports = logger;
