import React from "react";
import { User } from "../interfaces/user";

export interface IAppContext {
  user?: User;
  setUser?: (user: User) => void;
}

const AppContext = React.createContext<IAppContext>({});

export default AppContext;
