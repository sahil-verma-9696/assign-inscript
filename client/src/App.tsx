import React from "react";
import AuthProvider from "./provider/auth-provider";
import { RouterProvider } from "react-router";
import routes from "./routes";
import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AuthProvider>
        <RouterProvider router={routes} />
      </AuthProvider>
    </>
  );
}
