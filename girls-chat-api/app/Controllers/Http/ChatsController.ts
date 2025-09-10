import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import ChatsService from '../../../services/ChatsService';

export default class ChatsController {
    private chatsService = new ChatsService();
    public async index({ request, response }: HttpContextContract) {
        try {
            const { userID } = request.body();
            const uniqueChats = await this.chatsService.getUserChats(userID);
            return response.json({ success: true, chats: uniqueChats });
        } catch (error) {
            return response.json({ success: false, msg: error.message });
        }
    }

    public async show({ request, response }: HttpContextContract) {
        try {
            const { chatID } = request.qs();
            const chatSnapshot = await this.chatsService.showChat(chatID);
            if (!chatSnapshot) {
                return response.json({ success: true, chat: null });
            }
            const chat = { id: chatSnapshot.docs[0].id, ...chatSnapshot.docs[0].data() };
            return response.json({ success: true, chat });
        } catch (error) {
            return response.json({ success: false, msg: error.message });
        }
    }

    public async create({ request, response }: HttpContextContract) {
        try {
            const { host, participant } = request.body();
            const chat = await this.chatsService.createChat(host, participant);
            return response.json({ success: true, chat });
        } catch (error) {
            return response.json({ success: false, msg: error.message });
        }
    }
}
