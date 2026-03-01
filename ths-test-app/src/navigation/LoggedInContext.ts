import { createContext } from "react";

export interface LoggedInContextType {
  isLoggedIn: boolean;
  toggleIsLoggedIn: () => Promise<void>;
}

export const LoggedInContext = createContext<LoggedInContextType>({
  isLoggedIn: false,
  toggleIsLoggedIn: async () => {},
});
