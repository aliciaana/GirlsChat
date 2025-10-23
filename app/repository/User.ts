import UserModel from "../models/User";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class UserRepository {
    async updateUser(user: UserModel) {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    }

    async getUser(): Promise<UserModel | null> {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedData = JSON.parse(userData);
                const user = new UserModel();
                user.setId(parsedData.id);
                user.setName(parsedData.name);
                user.setEmail(parsedData.email);
                return user;
            }
            return null;
        } catch (error) {
            console.error("Failed to get user:", error);
            return null;
        }
    }

    async clearUser() {
        try {
            await AsyncStorage.removeItem('user');
        } catch (error) {
            console.error("Failed to clear user:", error);
        }
    }

}