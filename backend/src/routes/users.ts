import express from "express";
import userService from "../services/userService";
import middleware from "../utils/middleware";
import { UserInfo } from "../types";
import config from "../utils/config";
import { Response, Request } from "express";

const router = express.Router();

router.post(
  "/",
  middleware.userExtractor,
  async (req: Request<unknown, unknown, UserInfo>, res: Response) => {
    const loggedUser = req.user as UserInfo | undefined;
    if (!loggedUser || loggedUser.username !== config.ADMIN_USER) {
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

export default router;
