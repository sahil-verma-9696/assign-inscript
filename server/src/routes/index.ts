import { Router, RequestHandler } from "express";

import Paths from "@src/common/constants/Paths";
import UserRoutes from "./UserRoutes";
import TrelloRoutes from "./TrelloRoutes";
/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// ** Add UserRouter ** //

// Init router
const userRouter = Router();

// Get all users
userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

// Add UserRouter
apiRouter.use(Paths.Users.Base, userRouter);

// Init router
const authRouter = Router();

// Login
authRouter.get(Paths.Auth.Login, TrelloRoutes.login as RequestHandler);
authRouter.get(Paths.Auth.Callback, TrelloRoutes.callback as RequestHandler);
authRouter.get(Paths.Auth.Me, TrelloRoutes.me as RequestHandler);

// Add authRouter
apiRouter.use(Paths.Auth.Base, authRouter);

// Init router
const trelloRouter = Router();

// Get all boards
trelloRouter.get(Paths.Trello.boards, TrelloRoutes.boards as RequestHandler);

trelloRouter.head(`${Paths.Trello.boards}/webhook`, (req, res) => {
  return res.sendStatus(200);
});

trelloRouter.post(`${Paths.Trello.boards}/webhook`, (req, res) => {
  console.log("webhook");
  console.log(req.body);
  res.sendStatus(200);
});

// Add TrelloRouter
apiRouter.use(Paths.Trello.Base, trelloRouter);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
