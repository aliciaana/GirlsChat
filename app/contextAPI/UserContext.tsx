import React, { createContext, useState, ReactNode, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import UserModel from "../models/User";
import UserRepository from "../repository/User";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

interface UserContextType {
    userLogged: UserModel,
    setUserLogged: (user: UserModel) => void,
}

export const UserContext = createContext<UserContextType>({
    userLogged: new UserModel(),
    setUserLogged: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
    const [userLogged, setUserLogged] = useState<UserModel>(new UserModel());

    return <UserContext.Provider
        value={{
            setUserLogged,
            userLogged,
        }}
    >
        { children }
    </UserContext.Provider>
}