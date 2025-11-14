import { createBrowserRouter } from "react-router";
import PublicLayout from "../layouts/public-layout";
import Paths from "../common/constants/Paths";
import PrivateLayout from "../layouts/private-layout";
import BoardsPage from "../pages/boards-page";

export default createBrowserRouter([
  {
    path: Paths.Base,
    Component: PublicLayout,
  },
  {
    path: Paths.User.Base,
    Component: PrivateLayout,
    children: [
      {
        path: Paths.User.Board,
        Component: BoardsPage,
      },
    ],
  },
]);
