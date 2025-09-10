import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import db from '../../../services/ConnectFirebaseService'
import UserService from '../../../services/UserService';

export default class UsersController {
    private userService = new UserService();
    public async login({ request, response }: HttpContextContract) {
        try {
            const { email, password } = request.body()
            const user = await this.userService.getUserByEmailAndPassword(email, password);
            return response.json({ success: true, user })
        } catch (error) {
            return response.json({ success: false, msg: error.message })
        }
    }

    public async signUp({ request, response }: HttpContextContract) {
        try {
            const { email, password, name } = request.body()
            const user = await this.userService.createUser(email, password, name);
            return response.json({ success: true, user })
        } catch (error) {
            return response.json({ success: false, msg: error.message })
        }
    }

    public async index({ request, response }: HttpContextContract) {
        try {
            const userID = request.input('userID');
            if (!userID) {
                throw new Error("O ID do usuário é obrigatório")
            }
            const usersSnapshot = await db.collection('users').where('id', '!=', userID).get();
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return response.json({ success: true, users })
        } catch (error) {
            return response.json({ success: false, msg: error.message })
        }
    }

    public async update({ request, response }: HttpContextContract) {
        try {
            const { userID, UF, city, bio } = request.body();
            const updatedData: { UF?: string; city?: string; bio?: string; } = {};
            if (UF) updatedData.UF = UF;
            if (city) updatedData.city = city;
            if (bio) updatedData.bio = bio;
            const user = await this.userService.updateUser(userID, updatedData);
            return response.json({ success: true, user });
        } catch (error) {
            return response.json({ success: false, msg: error.message });
        }
    }
}
