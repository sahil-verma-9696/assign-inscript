import React from "react";
import AuthProvider from "./provider/auth-provider";
import {  RouterProvider } from "react-router";
import routes from "./routes";

export default function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={routes} />
      </AuthProvider>
    </>
  );
}
