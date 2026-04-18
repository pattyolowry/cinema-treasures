import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import config from "../utils/config";
import { Response, Request, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { RequestHandler } from "express";
import multer from "multer";

const requestLogger = (
  request: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (process.env.NODE_ENV != "test") {
    console.log("Method:", request.method);
    console.log("Path:  ", request.path);
    console.log("---");
  }

  next();
};

const unknownEndpoint = (_req: Request, response: Response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const tokenExtractor = (
  request: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    request.token = authorization.replace("Bearer ", "");
  } else {
    request.token = null;
  }

  next();
};

const userExtractor = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (!request.token) {
    return response.status(401).json({ error: "token invalid" });
  }

  const decodedToken = jwt.verify(
    request.token,
    config.JWT_SECRET,
  ) as JwtPayload;
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  } else {
    request.user = await User.findById(decodedToken.id);
  }

  return next();
};

const errorHandler = (
  error: Error,
  _req: Request,
  response: Response,
  next: NextFunction,
) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return response
      .status(400)
      .json({ error: "expected `username` to be unique" });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "token invalid" });
  } else if (
    error instanceof multer.MulterError &&
    error.code === "LIMIT_FILE_SIZE"
  ) {
    return response
      .status(400)
      .json({ error: "Image file too large. Max size is 100 KB." });
  }

  return next(error);
};

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  validate: { default: false },
  keyGenerator: (req: any) => {
    return `${req.ip}-${req.path}`;
  },
  message: {
    error: "Too many requests. Please try again later.",
  },
}) as unknown as RequestHandler;

export default {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
  apiLimiter,
};
