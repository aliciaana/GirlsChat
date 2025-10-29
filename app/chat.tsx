import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import UserModel from "./models/User";
import { useToast } from "react-native-toast-notifications";
import { useAuthenticatedUser } from "./contextAPI/UserContext";
import io, { Socket } from 'socket.io-client';
import { api, apiURL } from "./connection/api";

type Message = { id: string; text: string; sender: "me" | "other" };

interface Chat {
  id: number,
  id_host: number,
  last_message: string | null,
  last_message_at: string | null,
  participant: number,
  created_at: string,
  updated_at: string,
  messages: MessageInterface[]
}

interface MessageInterface {
  id: number,
  id_chat: number,
  text: string,
  seen: boolean,
  sent_by: number,
  sent_to: number,
  created_at: string,
  updated_at: string,
  sender: UserModel,
  receiver: UserModel
}

export default function ChatScreen() {
  const { id, otherID } = useLocalSearchParams<{ id: string, otherID: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [otherUser, setOtherUser] = useState<UserModel | null>(null);
  const listRef = useRef<FlatList>(null);
  const toast = useToast()
  const userLogged = useAuthenticatedUser(); // Garantido que não é null

  const sendMessage = () => {
    if (input.trim() && socket && userLogged.getId()) {
      socket.emit('send-message', { sentByID: userLogged.getId(), sentToID: otherID, text: input });
      setInput('');
    }
  };

  async function loadChat() {
    const decodedId = decodeURIComponent(id || '');
    if (decodedId === 'null') {
      return;
    }
    const response = await api().get("/chat/" + decodedId);
    if (response.data.success) {
      return setChat(response.data.chat)
    }
    toast.show("Houve um erro no carregamento das mensagens. " + response.data.msg);
  }

  async function loadOtherUser() {
    const response = await api().get("/usuario/" + otherID);
    if (response.data.success) {
      const userData = response.data.user;
      const user = new UserModel();
      user.setId(userData.id);
      user.setName(userData.name);
      user.setEmail(userData.email);
      setOtherUser(user);
    } else {
      toast.show("Houve um erro ao carregar o usuário. " + response.data.msg);
    }
  }

  function loadMessages(chat: Chat | null) {
    if (!chat) return;
    const messagesData: Message[] = chat.messages.map((message) => {
      return {
        id: message.id.toString(),
        text: message.text,
        sender: message.sent_by == Number(userLogged.getId()) ? "me" : "other"
      }
    })
    setMessages(messagesData)
  }

  async function markMessagesAsSeen() {
    if (!chat) return;
    const response = await api().post(`/chat/${chat.id}/atualizar-status-visto`, {
      userID: userLogged.getId()
    });
    if (!response.data.success) {
      toast.show("Houve um erro ao marcar as mensagens como vistas. " + response.data.msg);
    }
  }

  useEffect(() => {
    loadOtherUser();
  }, [otherID]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);


  useEffect(()=>{
    loadChat()
    markMessagesAsSeen()
  }, [userLogged])

  useEffect(() => {
    loadMessages(chat)
  }, [chat]);

  useEffect(() => {
    const newSocket = io(apiURL);

    newSocket.on(`receive-message-${userLogged.getId()}`, (msg: { id: string, text: string, sentBy: number }) => {
      setMessages((prev) => [...prev, { id: msg.id, text: msg.text, sender: msg.sentBy === Number(otherID) ? "other" : "me" }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>{otherUser?.getName() ?? "Girl"}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === "me" ? styles.myMessage : styles.otherMessage]}>
            <Text style={[styles.messageText, item.sender === "me" ? styles.myMessageText : styles.otherMessageText]}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffe6f0" },
  header: {
    padding: 15,
    backgroundColor: "#d63384",
    alignItems: "center"
  },
  headerText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  messagesContainer: { padding: 10, paddingBottom: 20 },
  message: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8
  },
  myMessage: {
    backgroundColor: "#d63384",
    alignSelf: "flex-end",
    borderTopRightRadius: 0
  },
  otherMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0
  },
  messageText: { fontSize: 15 },
  myMessageText: { color: "#fff" },
  otherMessageText: { color: "#333" },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: "#fff"
  },
  sendButton: {
    backgroundColor: "#d63384",
    borderRadius: 20,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center"
  },
  sendButtonText: { color: "#fff", fontWeight: "600" }
});
