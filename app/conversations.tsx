import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import UserRepository from "./repository/User";
import { UserContext } from "./contextAPI/UserContext";
import { api } from "./connection/api";

type Conv = {
  id: number;
  id_host: number;
  last_message: string | null;
  last_message_at: string | null;
  participant: number;
  created_at: string;
  updated_at: string;
  host: {
    id: number;
    email: string;
    password: string;
    name: string;
    last_login: string | null;
    created_at: string;
    updated_at: string;
  };
  participantUser: {
    id: number;
    email: string;
    name: string;
    last_login: string | null;
    created_at: string;
    updated_at: string;
  };
  messages: any[]
};

const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

export default function ConversationsScreen() {
  const router = useRouter();
  const [DATA, setDATA] = useState<Conv[]>([]);
  const { userLogged } = useContext(UserContext)

  const requestPermissions = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaStatus !== 'granted') {
      alert('Precisamos de permissão para acessar suas fotos!');
    }
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      alert('Precisamos de permissão para acessar a câmera!');
    }
    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
    if (notificationStatus !== 'granted') {
      alert('Precisamos de permissão para enviar notificações!');
    }
  };

  const renderItem = ({ item }: { item: Conv }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/chat?id=${item.id}&otherID=${item.host.id !== Number(userLogged.getId()) ? item.host.id : item.participantUser.id}`)}
    >
      <Avatar name={item.host.id !== Number(userLogged.getId()) ? item.host.name : item.participantUser.name} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.host.id !== Number(userLogged.getId()) ? item.host.name : item.participantUser.name}</Text>
      </View>
    </TouchableOpacity>
  );

  async function loadConversations() {
    try {
      const loggedUser = await new UserRepository().getUser();
      const response = await api().get(`/chats`, { params: { userID: loggedUser?.getId() } });
      if (response.data.success) {
        return setDATA(response.data.chats);
      }
      return setDATA([])
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  }

  useEffect(() => {
    requestPermissions();
    loadConversations()
  }, []);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Conversas</Text>

      <FlatList
        data={DATA}
        keyExtractor={(i, index) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/girls")}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffe6f0", padding: 16, paddingTop: 30 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d63384",
    marginBottom: 10,
    textAlign: "center"
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffb6d6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  avatarText: { fontWeight: "700", color: "#7a0b3b" },
  cardContent: { flex: 1, justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "600", color: "#333" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ff80b5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6
  },
  fabText: { fontSize: 34, color: "#fff", lineHeight: 36 }
});
