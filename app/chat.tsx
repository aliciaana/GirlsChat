import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import UserModel from "./models/User";
import io from "socket.io-client";
import { api, apiURL } from "./connection/api";
import Toast from "react-native-toast-message";
import UserRepository from "./repository/User";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Message = { id: string; text: string; sender: "me" | "other" };

interface Chat {
  id: number;
  id_host: number;
  last_message: string | null;
  last_message_at: string | null;
  participant: number;
  created_at: string;
  updated_at: string;
  messages: MessageInterface[];
}

interface MessageInterface {
  id: number;
  id_chat: number;
  text: string;
  seen: boolean;
  sent_by: number;
  sent_to: number;
  created_at: string;
  updated_at: string;
  sender: UserModel;
  receiver: UserModel;
}

export default function ChatScreen() {
  const { id, otherID } = useLocalSearchParams<{ id: string; otherID: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [otherUser, setOtherUser] = useState<UserModel | null>(null);
  const listRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Offset exato = altura do header (insets.top + 60px de conteúdo)
  const HEADER_HEIGHT = insets.top + 60;

  const sendMessage = async () => {
    const loggedUser = await new UserRepository().getUser();
    if (input.trim() && socket && loggedUser.getId()) {
      socket.emit("send-message", { sentByID: loggedUser.getId(), sentToID: otherID, text: input });
      setInput("");
    }
  };

  async function loadChat() {
    const loggedUser = await new UserRepository().getUser();
    const decodedId = decodeURIComponent(id || "");
    if (decodedId === "null") return;
    const response = await api().get("/chat", { params: { id: decodedId, userID: loggedUser.getId() } });
    if (response.data.success) {
      const loadedChat = response.data.chat;
      markMessagesAsSeen(loadedChat);
      return setChat(loadedChat);
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
      Toast.show({ type: "danger", text1: "Houve um erro ao carregar o usuário.", text2: response.data.msg });
    }
  }

  async function loadMessages(chat: Chat | null) {
    const loggedUser = await new UserRepository().getUser();
    if (!chat) return;
    const messagesData: Message[] = chat.messages.map((message) => ({
      id: message.id.toString(),
      text: message.text,
      sender: message.sent_by === Number(loggedUser.getId()) ? "me" : "other",
    }));
    setMessages(messagesData);
  }

  async function markMessagesAsSeen(loadedChat: Chat) {
    const loggedUser = await new UserRepository().getUser();
    if (!loadedChat) return;
    const response = await api().put(`/chat/${loadedChat.id}/atualizar-status-visto`, {
      userID: loggedUser?.getId(),
    });
    if (!response.data.success) {
      Toast.show({ type: "danger", text1: "Erro ao marcar mensagens como vistas.", text2: response.data.msg });
    }
  }

  useEffect(() => { loadOtherUser(); }, [otherID]);
  useEffect(() => { listRef.current?.scrollToEnd({ animated: true }); }, [messages]);
  useEffect(() => { loadChat(); }, []);
  useEffect(() => { loadMessages(chat); }, [chat]);

  useEffect(() => {
    new UserRepository().getUser().then((userLogged) => {
      const newSocket = io(apiURL);
      newSocket.on(
        `receive-message-${userLogged?.getId()}`,
        (msg: { id: string; text: string; sentBy: number }) => {
          setMessages((prev) => [
            ...prev,
            { id: msg.id, text: msg.text, sender: msg.sentBy === Number(otherID) ? "other" : "me" },
          ]);
        }
      );
      setSocket(newSocket);
      return () => { newSocket.close(); };
    });
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={HEADER_HEIGHT}
    >
      {/* Header com paddingTop dinâmico baseado nos insets reais */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="arrow.backward" color="#fff" size={20} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUser?.getName() ?? "Girl"}</Text>
          <Text style={styles.headerStatus}>online</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sender === "me" ? styles.bubbleMe : styles.bubbleOther]}>
            <Text style={[styles.bubbleText, item.sender === "me" ? styles.bubbleTextMe : styles.bubbleTextOther]}>
              {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Sem paddingBottom extra — o KAV gerencia o espaço com o teclado */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#c9a0b8"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!input.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6f0",
  },
  header: {
    backgroundColor: "#d63384",
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 1,
  },
  headerStatus: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  bubbleMe: {
    backgroundColor: "#d63384",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    shadowColor: "#d63384",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: "#fff",
  },
  bubbleTextOther: {
    color: "#333",
  },
  inputRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f5e6ef",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff5f9",
    borderWidth: 1.5,
    borderColor: "#f5c0d8",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#d63384",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#d63384",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#e8a0c0",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});