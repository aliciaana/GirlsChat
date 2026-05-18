import { useRouter } from "expo-router";
import UserRepository from "../repository/User";
import { api } from "../connection/api";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { FlatList, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Girl = {
  id: string;
  name: string;
  profile_picture: string | null;
};

export default function GirlsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [girls, setGirls] = React.useState<Girl[]>([]);
  const [loading, setLoading] = React.useState(true);

  const handleStartChat = (girl: Girl) => {
    router.push(`/chat?id=null&otherID=${girl.id}`);
  };

  async function loadGirls() {
    try {
      setLoading(true);
      const loggedUser = await new UserRepository().getUser();
      const response = await api().get("/usuarios", { params: { userID: loggedUser.getId() } });
      if (response.data.success) {
        const { users } = response.data;
        // FIX: campo corrigido de user.photo para user.profile_picture
        const girlsData = users.map((user: any) => ({
          id: user.id,
          name: user.name,
          profile_picture: user.profile_picture ?? null,
        }));
        return setGirls(girlsData);
      }
      Toast.show({
        type: "danger",
        text1: "Houve um erro ao carregar as garotas.",
        text2: response.data.msg,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGirls();
  }, []);

  const renderItem = ({ item }: { item: Girl }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleStartChat(item)} activeOpacity={0.75}>
      {item.profile_picture ? (
        <Image
          source={{ uri: item.profile_picture }}
          style={styles.avatarImage}
          contentFit="cover"
        />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.cta}>Toque para conversar →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Girls 💕</Text>
        <Text style={styles.headerSubtitle}>Escolha uma amiga para conversar</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d63384" />
        </View>
      ) : (
        <FlatList
          data={girls}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: "#d63384",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ffb6d6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#7a0b3b",
    fontWeight: "800",
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2d2d2d",
    marginBottom: 2,
  },
  cta: {
    fontSize: 12,
    color: "#d63384",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
