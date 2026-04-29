import express from "express";
import userService from "../services/userService";
import middleware from "../utils/middleware";
import { UserInfo, PushSubscription } from "../types";
import { Response, Request, NextFunction } from "express";
import { pushSubscriptionSchema } from "../utils/schemas";

const router = express.Router();

router.post(
  "/",
  middleware.userExtractor,
  async (req: Request<unknown, unknown, UserInfo>, res: Response) => {
    const loggedUser = req.user as UserInfo | undefined;
    if (!loggedUser || !loggedUser.admin) {
      res.status(401).send({ error: "Only admins can create new users" });
      return;
    }

    try {
      const user = await userService.createUser(req.body);
      res.json(user);
    } catch (error: unknown) {
      let errorMessage = "Something went wrong.";
      if (error instanceof Error) {
        errorMessage += " Error: " + error.message;
      }
      res.status(400).send({ error: errorMessage });
    }
  },
);

router.post(
  "/login",
  async (req: Request<unknown, unknown, UserInfo>, res: Response) => {
    try {
      const user = await userService.login(req.body);
      res.json(user);
    } catch (error: unknown) {
      let errorMessage = "Something went wrong.";
      if (error instanceof Error) {
        errorMessage += " Error: " + error.message;
      }
      res.status(400).send({ error: errorMessage });
    }
  },
);

const newLogSubscriptionParser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    pushSubscriptionSchema.parse(req.body);
    next();
  } catch (error: unknown) {
    next(error);
  }
};

router.post(
  "/push-subscriptions",
  middleware.userExtractor,
  newLogSubscriptionParser,
  async (req: Request<unknown, unknown, PushSubscription>, res: Response) => {
    try {
      const loggedUser = req.user as UserInfo | undefined;
      if (!loggedUser) {
        return res.status(404).end();
      }
      const updatedUser = await userService.addPushSubscription(
        loggedUser.id,
        req.body,
      );
      return res.json(updatedUser);
    } catch (error: unknown) {
      let errorMessage = "Something went wrong.";
      if (error instanceof Error) {
        errorMessage += " Error: " + error.message;
      }
      return res.status(400).send({ error: errorMessage });
    }
  },
);

export default router;
