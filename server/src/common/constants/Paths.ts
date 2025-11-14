export default {
  Base: "/api",
  Users: {
    Base: "/users",
    Get: "/all",
    Add: "/add",
    Update: "/update",
    Delete: "/delete/:id",
  },
  Auth: {
    Base: "/auth",
    Login: "/login",
    Logout: "/logout",
    Callback: "/callback",
    Me: "/me",
  },
  Trello: {
    Base: "/trello",
    boards: "/boards",
  },
} as const;
