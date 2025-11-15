import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { api } from "./connection/api";
import Toast from "react-native-toast-message";
import UserModel from "./models/User";
import { UserContext } from "./contextAPI/UserContext";
import UserRepository from "./repository/User";
import { IconSymbol } from "@/components/ui/IconSymbol.ios";

export default function GirlsScreen() {
  const router = useRouter();
  const [girls, setGirls] = React.useState<{ id: string; name: string; profile_picture: string, bio: string }[]>([]);

  async function loadGirls() {
    const loggedUser = await new UserRepository().getUser();
    const response = await api().get("/usuarios", { params: { userID: loggedUser.getId()} })
    if (response.data.success) {
      const { users } = response.data;
      const girlsData = users.map((user: any) => { return { id: user.id, name: user.name, photo: user.photo, bio: user.bio }})
      return setGirls(girlsData)
    }
    Toast.show({
      type: "danger",
      text1: "Houve um erro ao carregar as garotas.",
      text2: response.data.msg,
    });
  }

  useEffect(() => {
    loadGirls()
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity style={{ height: 40, width: 40 }} onPressOut={() => router.back()}>
          <IconSymbol name="arrow.backward" color="#d63384"></IconSymbol>
        </TouchableOpacity>
        <Text style={styles.title}>Conheça todas as nossas amigas!</Text>
      </View>

      <FlatList
        data={girls}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.avatar}>
              {item.profile_picture ? (
                <Image source={{ uri: item.profile_picture }} style={{ width: 100, height: 100, borderRadius: "50%" }} />
              ) : (
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              )}
            </View>
            <Text style={styles.name}>{item.name}</Text>
            {item.bio ? <Text style={styles.bio}>{item.bio}</Text> : <Text style={styles.bioEmpty}>Sem Bio</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe6f0",
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#d63384",
    textAlign: "center",
    height: 40,
  },
  card: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center", // Centraliza verticalmente
    backgroundColor: "#fff",
    padding: 20, // Aumentar padding
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  avatar: {
    width: 100, // Aumentar tamanho
    height: 100,
    borderRadius: "50%",
    backgroundColor: "#d63384",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12 // Espaço abaixo do avatar
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 20 // Aumentar fonte
  },
  name: {
    textAlign: "center",
    fontSize: 18, // Aumentar fonte
    fontWeight: "600",
    color: "#333",
    marginBottom: 4 // Espaço entre nome e bio
  },
  bio: {
    fontSize: 14,
    color: "#666",
    textAlign: "center" // Centralizar bio
  },
  bioEmpty: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic"
  }
});
