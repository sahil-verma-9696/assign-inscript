export type AuthContextType = {
  user: UserType | null;
  isAuthenticated: boolean;
  logout: () => void;
};

export type UserType = {
  id: string;
  fullName: string;
  initials: string;
  username: string;
};
