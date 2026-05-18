import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { UserContext } from "../contextAPI/UserContext";
import { usePushNotifications } from "../providers/usePushNotifications";
import UserRepository from "../repository/User";
import { api } from "../connection/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Conv = {
  id: number;
  id_host: number;
  last_message: string | null;
  last_message_at: string | null;
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
  otherParticipants: {
    id: number;
    email: string;
    name: string;
    last_login: string | null;
    created_at: string;
    updated_at: string;
    profile_picture: string | null;
  }[];
  messages: any[];
};

const AvatarFallback: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarFallbackText}>{initials}</Text>
    </View>
  );
};

export default function ConversationsScreen() {
  const router = useRouter();
  const [DATA, setDATA] = useState<Conv[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { userLogged } = React.useContext(UserContext);
  const { expoPushToken } = usePushNotifications();
  const insets = useSafeAreaInsets();

  const requestPermissions = async () => {
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaStatus !== "granted") alert("Precisamos de permissão para acessar suas fotos!");
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== "granted") alert("Precisamos de permissão para acessar a câmera!");
    const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
    if (notificationStatus !== "granted") alert("Precisamos de permissão para enviar notificações!");
  };

  const renderItem = ({ item }: { item: Conv }) => {
    const other = item.otherParticipants[0];
    const unread = item.messages.length;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/chat?id=${item.id}&otherID=${other.id}`)}
        activeOpacity={0.75}
      >
        <View style={styles.avatarContainer}>
          {other.profile_picture ? (
            <Image
              source={{ uri: other.profile_picture }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <AvatarFallback name={other.name} />
          )}
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.name}>{other.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message ?? "Toque para conversar ✨"}
          </Text>
        </View>

        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  async function loadConversations() {
    try {
      setLoadingData(true);
      const loggedUser = await new UserRepository().getUser();
      const response = await api().get(`/chats`, {
        params: { userID: loggedUser?.getId() },
        headers: {
          "expo-notification-token": expoPushToken,
          "expo-notification-id": loggedUser.getId(),
        },
      });
      setDATA(response.data.success ? response.data.chats : []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    requestPermissions();
    loadConversations();
  }, [userLogged]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Conversas</Text>
        <Text style={styles.headerSubtitle}>{DATA.length} conversa{DATA.length !== 1 ? "s" : ""}</Text>
      </View>

      {loadingData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d63384" />
        </View>
      ) : DATA.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💬</Text>
          <Text style={styles.emptyTitle}>Nenhuma conversa ainda</Text>
          <Text style={styles.emptySubtitle}>Toque no botão + para conhecer novas amigas!</Text>
        </View>
      ) : (
        <FlatList
          data={DATA}
          keyExtractor={(i) => i.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => router.push("/girls")}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6f0",
  },
  header: {
    backgroundColor: "#d63384",
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#d63384",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#ffb6d6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    fontWeight: "800",
    fontSize: 18,
    color: "#7a0b3b",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4ade80",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2d2d2d",
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: "#999",
    fontWeight: "400",
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#d63384",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#d63384",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#d63384",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: "#fff",
    lineHeight: 36,
    fontWeight: "300",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#d63384",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#b07090",
    textAlign: "center",
    lineHeight: 20,
  },
});
