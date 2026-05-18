import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { api } from "./connection/api";
import Toast from "react-native-toast-message";
import UserRepository from "./repository/User";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Girl = {
  id: string;
  name: string;
  profile_picture: string | null;
  bio: string;
};

export default function GirlsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [girls, setGirls] = React.useState<Girl[]>([]);
  const [loading, setLoading] = React.useState(true);

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
          bio: user.bio ?? "",
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
    <View style={styles.card}>
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
      <Text style={styles.name}>{item.name}</Text>
      {item.bio ? (
        <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
      ) : (
        <Text style={styles.bioEmpty}>Sem bio ainda...</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="arrow.backward" color="#fff" size={20} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Nossas Amigas 💕</Text>
          <Text style={styles.headerSubtitle}>Conheça todas as girls</Text>
        </View>
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
          numColumns={2}
          columnWrapperStyle={styles.row}
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
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
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
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    width: "48.5%",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    shadowColor: "#d63384",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  // FIX: borderRadius numérico em vez de "50%" (inválido no RN)
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ffb6d6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: "#7a0b3b",
    fontWeight: "800",
    fontSize: 26,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2d2d2d",
    textAlign: "center",
    marginBottom: 4,
  },
  bio: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    lineHeight: 17,
  },
  bioEmpty: {
    fontSize: 12,
    color: "#ccc",
    textAlign: "center",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
