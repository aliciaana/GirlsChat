import db from "./ConnectFirebaseService";

export default class ChatsService {
    public async getUserChats(userID: string) {
        try {
            const hostChatsSnapshot = await db.collection('chats').where('host', '==', userID).get();
            const participantChatsSnapshot = await db.collection('chats').where('participant', '==', userID).get();

            const chats = [
                ...hostChatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                ...participantChatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            ];

            const uniqueChats = Array.from(new Map(chats.map(chat => [chat.id, chat])).values());
            return uniqueChats;
        } catch (error) {
            throw new Error("Erro ao buscar chats do usuário: " + error.message);
        }
    }

    public async showChat(chatID: string) {
        try {
            if (!chatID) {
                throw new Error("O ID do chat é obrigatório")
            }
            const chatSnapshot = await db.collection('chats')
                .doc(chatID)
                .get();
            return chatSnapshot;
        } catch (error) {
            throw new Error("Erro ao buscar o chat: " + error.message);
        }
    }

    public async createChat(host: string, participant: string) {
        try {
            if (!host || !participant) {
                throw new Error("Os IDs do host e participante são obrigatórios")
            }
            const existingChatSnapshot = await db.collection('chats')
                .where('host', 'in', [host, participant])
                .where('participant', 'in', [host, participant])
                .get();

            if (!existingChatSnapshot.empty) {
                throw new Error("Chat já existe entre esses usuários");
            }

            const newChat = {
                host,
                participant,
                createdAt: new Date(),
            };

            const chatRef = await db.collection('chats').add(newChat);
            const chat = { id: chatRef.id, ...newChat };
            return chat;
        } catch (error) {
            throw new Error("Erro ao criar o chat: " + error.message);
        }
    }
}