import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import MessagesService from 'App/services/MessagesService';

export default class MessagesController {
    private messagesService = new MessagesService();
    public async index({ response, request }: HttpContextContract) {
        try {
            const chatID = request.input('chatID');
            const messages = await this.messagesService.getMessagesByChatID(chatID);
            return response.json({ success: true, data: messages })
        } catch (e) {
            return response.json({ success: false, msg: e.message });
        }
    }

    public async create({ request, response }: HttpContextContract) {
        try {
            const { chatID, sentByID, sentToID, text } = request.body();
            const newMessage = {
                sentBy: sentByID,
                sentTo: sentToID,
                text,
                createdAt: new Date(),
                seen: false
            };
            const messageRef = await this.messagesService.createMessage(chatID, newMessage);
            const message = { id: messageRef.id, ...newMessage };
            return response.json({ success: true, message });
        } catch (e) {
            return response.json({ success: false, msg: e.message });
        }
    }

    public async updateSeenStatus({ request, response }: HttpContextContract) {
        try {
            const { chatID } = request.body();
            await this.messagesService.updateMessageSeenStatus(chatID);
            return response.json({ success: true, msg: "Status atualizado com sucesso" });
        } catch (e) {
            return response.json({ success: false, msg: e.message });
        }
    }
}
