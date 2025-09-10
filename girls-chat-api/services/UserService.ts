import { isValidEmail } from "../utils/validation";
import db from "./ConnectFirebaseService";
import { md5 } from "js-md5";

export default class UserService {
    public async getUserByEmailAndPassword(email: string, password: string) {
        try {
            if (!email || !password || !isValidEmail(email)) {
                throw new Error("Preencha o campo senha e e-mail corretamente")
            }

            const userSnapshot = await db.collection('users')
                .where('email', '==', email)
                .where('senha', '==', md5(password))
                .get();

            if (userSnapshot.empty) {
                throw new Error("Usuário não encontrado")
            }

            const user = userSnapshot.docs[0].data();
            return { id: userSnapshot.docs[0].id, ...user };
        } catch (error) {
            throw new Error("Erro ao buscar usuário: " + error.message);
        }
    }

    public async createUser(email: string, password: string, name: string) {
        try {
            if (!email || !password || !name || !isValidEmail(email)) {
                throw new Error("Preencha todos os campos corretamente")
            }
            const userSnapshot = await db.collection('users')
                .where('email', '==', email)
                .get();

            if (!userSnapshot.empty) {
                throw new Error("E-mail já cadastrado")
            }

            const newUser = {
                email,
                senha: md5(password),
                name,
                createdAt: new Date(),
                avatar: null,
                UF: null,
                city: null,
                bio: null
            }

            const userRef = await db.collection('users').add(newUser);
            const user = { id: userRef.id, ...newUser };
            return user;
        } catch (error) {
            throw new Error("Erro ao criar usuário: " + error.message);
        }
    }

    public async updateUser(userID: string, updatedData: { UF?: string; city?: string; bio?: string; }) {
        try {
            if (!userID) {
                throw new Error("O ID do usuário é obrigatório");
            }
            const userSnapshot = await db.collection('users')
                .where('id', '==', userID)
                .get();
            if (userSnapshot.empty) {
                throw new Error("Usuário não encontrado");
            }
            const userRef = db.collection('users').doc(userID);
            await userRef.update(updatedData);
            const updatedUserSnapshot = await userRef.get();
            if (!updatedUserSnapshot.exists) {
                throw new Error("Usuário não encontrado após a atualização");
            }
            return { id: updatedUserSnapshot.id, ...updatedUserSnapshot.data() };
        } catch (error) {
            throw new Error("Erro ao atualizar usuário: " + error.message);
        }
    }
}