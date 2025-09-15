import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Message = { id: string; text: string; sender: "me" | "other" };

export default function ChatScreen() {
  const { name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Oi, tudo bem?", sender: "other" },
    { id: "2", text: "Oi! Tudo ótimo e você?", sender: "me" },
    { id: "3", text: "Tô bem também 😄", sender: "other" }
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (input.trim().length === 0) return;
    const newMsg: Message = { id: Date.now().toString(), text: input.trim(), sender: "me" };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    // scroll down
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>{name ?? "Girl"}</Text>
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
