import React from "react";
import AuthContext from "../context/auth-context";
import StorageKey from "../common/constants/StorageKey";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  /***************************************************************
   * constants
   ***************************************************************/

  const SEARCH_PARAMS_KEYS = {
    accessToken: "accessToken",
    expiresIn: "expiresIn",
  };

  /***************************************************************
   * Local States
   ***************************************************************/
  const [user, setUser] = React.useState(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  /***************************************************************
   * useEffects
   ***************************************************************/

  // Check url for access token
  React.useEffect(() => {
    const currentPath = window.location.href;

    const pathHasCredentials =
      currentPath.includes(SEARCH_PARAMS_KEYS.accessToken) &&
      currentPath.includes(SEARCH_PARAMS_KEYS.expiresIn);

    if (pathHasCredentials) {
      const url = new URL(window.location.href);
      const accessToken = url.searchParams.get(SEARCH_PARAMS_KEYS.accessToken);
      const expiresIn = url.searchParams.get(SEARCH_PARAMS_KEYS.expiresIn);

      if (accessToken && expiresIn) {
        const numericExpiresIn = Number(expiresIn);
        if (isNaN(numericExpiresIn)) {
          throw new Error("Expires in is not a number");
        }
        const normalizeExpiresIn = String(numericExpiresIn + Date.now());

        localStorage.setItem(StorageKey.ACCESS_TOKEN, accessToken);
        localStorage.setItem(StorageKey.EXPIRES_IN, normalizeExpiresIn);
        setIsAuthenticated(true);

        // Remove access token from url
        url.searchParams.delete(SEARCH_PARAMS_KEYS.accessToken);
        url.searchParams.delete(SEARCH_PARAMS_KEYS.expiresIn);
        window.location.href = "/";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.href]);

  // Check for access token & user in local storage
  React.useEffect(() => {
    const accessToken = localStorage.getItem(StorageKey.ACCESS_TOKEN);
    const expiresIn = localStorage.getItem(StorageKey.EXPIRES_IN);
    const userInfo = localStorage.getItem(StorageKey.USER_INFO);

    if (!accessToken || !expiresIn) {
      setIsAuthenticated(false);
      return;
    }

    if (accessToken && expiresIn) {
      const numericExpiresIn = Number(expiresIn);
      if (isNaN(numericExpiresIn)) {
        throw new Error("Expires in is not a number");
      }
      if (numericExpiresIn < Date.now()) {
        localStorage.removeItem(StorageKey.ACCESS_TOKEN);
        localStorage.removeItem(StorageKey.EXPIRES_IN);
        setIsAuthenticated(false);
        return;
      } else {
        setIsAuthenticated(true);
        if (userInfo) {
          setUser(JSON.parse(userInfo));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.href, isAuthenticated]);

  // Get User Info
  React.useEffect(() => {
    if (isAuthenticated && user === null) {
      (async function () {
        const res = await fetch("http://localhost:3000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              StorageKey.ACCESS_TOKEN
            )}`,
          },
        });
        const data = await res.json();
        setUser(data);
        localStorage.setItem(StorageKey.USER_INFO, JSON.stringify(data));
      })();
    }
  }, [isAuthenticated, user]);

  /***************************************************************
   * Functions
   ***************************************************************/

  const logout = (): void => {
    localStorage.removeItem(StorageKey.ACCESS_TOKEN);
    localStorage.removeItem(StorageKey.EXPIRES_IN);
    localStorage.removeItem(StorageKey.USER_INFO);
    setIsAuthenticated(false);
  };

  /***************************************************************
   * Context value
   ***************************************************************/
  const contextValue = {
    user,
    isAuthenticated,
    logout,
  };

  /***************************************************************
   * JSX
   ***************************************************************/
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
