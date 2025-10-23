import React, { createContext, useState, ReactNode } from "react";
import UserModel from "../models/User";

interface UserContextType {
    userLogged: UserModel,
    setUserLogged: (user: UserModel) => void
}

export const UserContext = createContext<UserContextType>({
    userLogged: {} as UserModel,
    setUserLogged: () => {}
});

export function UserProvider({ children }: { children: ReactNode }) {
    const [userLogged, setUserLogged] = useState({} as UserModel)

    return <UserContext.Provider
        value={{
            setUserLogged,
            userLogged
        }}
    >
        { children }
    </UserContext.Provider>
}