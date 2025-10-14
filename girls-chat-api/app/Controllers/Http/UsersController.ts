import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from '../../services/UserService';

export default class UsersController {
    private userService: UserService;
    constructor() {
        this.userService = new UserService();
    }
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
            const users = await this.userService.getAllUsersExcept(userID);
            return response.json({ success: true, users })
        } catch (error) {
            return response.json({ success: false, msg: error.message })
        }
    }

    public async update({ request, response, params }: HttpContextContract) {
        try {
            const { UF, city, bio, name, email } = request.body();
            const userID = params.id;
            const updatedData: { UF?: string; city?: string; bio?: string; name?: string; email?: string } = {};
            if (UF) updatedData.UF = UF;
            if (city) updatedData.city = city;
            if (bio) updatedData.bio = bio;
            if (name) updatedData.name = name;
            if (email) updatedData.email = email;
            const user = await this.userService.updateUser(userID, updatedData);
            return response.json({ success: true, user });
        } catch (error) {
            return response.json({ success: false, msg: error.message });
        }
    }
}
