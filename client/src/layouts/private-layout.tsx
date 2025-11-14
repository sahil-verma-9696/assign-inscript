import { Outlet } from "react-router";
import Navbar from "../components/navbar/navbar";

export default function PrivateLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}
