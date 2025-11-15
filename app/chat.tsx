import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import UserModel from "./models/User";
import io, { Socket } from 'socket.io-client';
import { api, apiURL } from "./connection/api";
import Toast from "react-native-toast-message";
import { UserContext } from "./contextAPI/UserContext";
import UserRepository from "./repository/User";
import { IconSymbol } from "@/components/ui/IconSymbol";
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
  const sendMessage = async () => {
    const loggedUser = await new UserRepository().getUser();
    if (input.trim() && socket && loggedUser.getId()) {
      socket.emit('send-message', { sentByID: loggedUser.getId(), sentToID: otherID, text: input });
      setInput('');
    }
  };

  async function loadChat() {
    const loggedUser = await new UserRepository().getUser();
    const decodedId = decodeURIComponent(id || '');
    if (decodedId === 'null') {
      return;
    }
    const response = await api().get("/chat", { params: { id: decodedId, userID: loggedUser.getId() } });
    if (response.data.success) {
      const loadedChat = response.data.chat;
      markMessagesAsSeen(loadedChat)
      return setChat(loadedChat)
    }
    alert("Houve um erro ao carregar o chat: " + response.data.msg);
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
      Toast.show({
        type: "danger",
        text1: "Houve um erro ao carregar o usuário.",
        text2: response.data.msg,
      });
    }
  }

  async function loadMessages(chat: Chat | null) {
    const loggedUser = await new UserRepository().getUser();
    if (!chat) return;
    const messagesData: Message[] = chat.messages.map((message) => {
      return {
        id: message.id.toString(),
        text: message.text,
        sender: message.sent_by == Number(loggedUser.getId()) ? "me" : "other"
      }
    })
    setMessages(messagesData)
  }

  async function markMessagesAsSeen(loadedChat: Chat) {
    const loggedUser = await new UserRepository().getUser();
    if (!loadedChat) return;
    const response = await api().put(`/chat/${loadedChat.id}/atualizar-status-visto`, {
      userID: loggedUser?.getId()
    });
    if (!response.data.success) {
      Toast.show({
        type: "danger",
        text1: "Houve um erro ao marcar as mensagens como vistas.",
        text2: response.data.msg,
      });
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
  }, [])

  useEffect(() => {
    loadMessages(chat)
  }, [chat]);

  useEffect(() => {
    new UserRepository().getUser().then((userLogged) => {
      const newSocket = io(apiURL);    
      newSocket.on(`receive-message-${userLogged?.getId()}`, (msg: { id: string, text: string, sentBy: number }) => {
        setMessages((prev) => [...prev, { id: msg.id, text: msg.text, sender: msg.sentBy === Number(otherID) ? "other" : "me" }]);
      });
  
      setSocket(newSocket);
  
      return () => {
        newSocket.close();
      };
    });
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#d63384", padding: 15 }}>
        <TouchableOpacity style={{ height: 40, width: 40 }} onPressOut={() => router.back()}>
          <IconSymbol name="arrow.backward" color="#fff"></IconSymbol>
        </TouchableOpacity>
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
    backgroundColor: "#d63384",
    alignItems: "center"
  },
  headerText: { fontSize: 20, fontWeight: "700", color: "#fff", height: 40 },
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
