import React, { createContext, useState, ReactNode, useEffect } from "react";
import UserModel from "../models/User";
import UserRepository from "../repository/User";
import { Toast } from "react-native-toast-notifications";
import { router } from "expo-router";

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

    async function fetchUser() {
        const user = await new UserRepository().getUser();
        if (user) {
            setUserLogged(user);
        } else {
            Toast.show("Faça login para continuar", { type: "warning" });
            router.replace("/");
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    return <UserContext.Provider
        value={{
            setUserLogged,
            userLogged
        }}
    >
        { children }
    </UserContext.Provider>
}