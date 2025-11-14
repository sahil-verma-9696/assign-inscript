import React from "react";
import useAuthContext from "../../hooks/useAuthContext";

export default function Navbar(): React.ReactNode {
  const { isAuthenticated, user, logout } = useAuthContext();
  const [open, setOpen] = React.useState(false);

  // helper to get avatar OR initials
  const renderAvatar = () => {
    // fallback initials box
    const initials = user?.initials || "U";

    return (
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold cursor-pointer">
        {initials}
      </div>
    );
  };

  return (
    <nav className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <a href="/" className="text-xl font-semibold text-gray-800">
        Trello Dashboard
      </a>

      {/* Right */}
      <div className="flex items-center gap-4">
        {!isAuthenticated ? (
          <a
            href="http://localhost:3000/api/auth/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Login
          </a>
        ) : (
          <div className="relative">
            <div onClick={() => setOpen(!open)}>{renderAvatar()}</div>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 border z-50">
                <div className="px-4 py-2">
                  <p className="font-semibold text-gray-700">{user?.fullName}</p>
                  <p className="text-sm text-gray-500">@{user?.username}</p>
                </div>

                <hr />

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
