import ChatsService from "./ChatsService";
import db from "./ConnectFirebaseService";

export default class MessagesService {
    public async getMessagesByChatID(chatID: string) {
        try {
            if (!chatID) {
                throw new Error("O ID do chat é obrigatório")
            }
            const messagesSnapshot = await db.collection('chats').doc(chatID).collection('messages').get();
            const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return messages;
        } catch (error) {
            throw new Error("Erro ao buscar mensagens: " + error.message);
        }
    }

    public async createMessage(chatID: string, newMessage: { sentBy: string; sentTo: string; text: string; createdAt: Date; seen: boolean; }) {
        try {
            if (!newMessage.sentBy || !newMessage.sentTo || !newMessage.text) {
                throw new Error("Os campos sentBy, sentTo e text são obrigatórios");
            }
            if (!chatID) {
                const chatsService = new ChatsService();
                const chat = await chatsService.createChat(newMessage.sentBy, newMessage.sentTo);
                chatID = chat.id;
            }
            const messageRef = await db.collection('chats').doc(chatID).collection('messages').add(newMessage);
            return messageRef;
        } catch (error) {
            throw new Error("Erro ao criar mensagem: " + error.message);
        }
    }

    public async updateMessageSeenStatus(chatID: string) {
        try {
            if (!chatID) {
                throw new Error("O ID do chat é obrigatório");
            }
            const messagesSnapshot = await db.collection('chats').doc(chatID).collection('messages').where('seen', '==', false).get();
            const batch = db.batch();
            messagesSnapshot.docs.forEach(doc => {
                const messageRef = db.collection('chats').doc(chatID).collection('messages').doc(doc.id);
                batch.update(messageRef, { seen: true });
            });
            await batch.commit();
        } catch (error) {
            throw new Error("Erro ao atualizar status das mensagens: " + error.message);
        }
    }
}