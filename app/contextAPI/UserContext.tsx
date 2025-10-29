import React, { createContext, useState, ReactNode, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import UserModel from "../models/User";
import UserRepository from "../repository/User";
import { Toast } from "react-native-toast-notifications";
import { router } from "expo-router";

interface UserContextType {
    userLogged: UserModel | null,
    setUserLogged: (user: UserModel | null) => void,
    fetchUser: () => void,
    isLoading: boolean,
    isUserReady: boolean
}

export const UserContext = createContext<UserContextType>({
    userLogged: null,
    setUserLogged: () => {},
    fetchUser: () => {},
    isLoading: true,
    isUserReady: false
});

export function UserProvider({ children }: { children: ReactNode }) {
    const [userLogged, setUserLogged] = useState<UserModel | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUserReady, setIsUserReady] = useState(false)

    async function fetchUser() {
        try {
            setIsLoading(true);
            const user = await new UserRepository().getUser();
            if (user) {
                setUserLogged(user);
                setIsUserReady(true);
            } else {
                setUserLogged(null);
                setIsUserReady(false);
                Toast.show("Faça login para continuar", { type: "warning" });
                router.replace("/");
            }
        } catch (error) {
            console.error("Erro ao buscar usuário:", error);
            setUserLogged(null);
            setIsUserReady(false);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    return <UserContext.Provider
        value={{
            setUserLogged,
            userLogged,
            fetchUser,
            isLoading,
            isUserReady
        }}
    >
        { children }
    </UserContext.Provider>
}

// Componente que só renderiza children quando usuário estiver carregado
export function AuthGuard({ children }: { children: ReactNode }) {
    const { isLoading, isUserReady } = React.useContext(UserContext);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    if (!isUserReady) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Redirecionando para login...</Text>
            </View>
        );
    }

    return <>{children}</>;
}

// Hook que garante que userLogged não é null
export function useAuthenticatedUser(): UserModel {
    const { userLogged, isUserReady } = React.useContext(UserContext);
    
    if (!isUserReady || !userLogged) {
        throw new Error("useAuthenticatedUser deve ser usado dentro do AuthGuard");
    }
    
    return userLogged;
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666'
    }
});