import { Router, RequestHandler } from "express";

import Paths from "@src/common/constants/Paths";
import UserRoutes from "./UserRoutes";
import TrelloService from "@src/services/TrelloService";

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
authRouter.get(Paths.Auth.Login, TrelloService.login as RequestHandler);
authRouter.get(Paths.Auth.Callback, TrelloService.callback as RequestHandler);

// Add authRouter
apiRouter.use(Paths.Auth.Base, authRouter);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
