import { createBrowserRouter } from "react-router";
import PublicLayout from "../layouts/public-layout";

export default createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
  },
]);
