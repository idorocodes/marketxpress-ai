const error404Middleware = (req, res, next) => {
  res.status(404).json({
    success: false,
    code: 404,
    message: "Resource does not exist on the server !",
  });

  next();
};

export default error404Middleware;
