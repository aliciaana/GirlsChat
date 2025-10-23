import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GirlsScreen() {
  const router = useRouter();

  const [girls, setGirls] = React.useState<{ id: string; name: string }[]>([]);

  const handleStartChat = (girl: { id: string; name: string }) => {
    router.push(`/chat?id=${girl.id}&name=${encodeURIComponent(girl.name)}`);
  };

  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha uma Girl para conversar</Text>

      <FlatList
        data={girls}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleStartChat(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
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
    marginBottom: 20,
    textAlign: "center"
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d63384",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16
  },
  name: {
    fontSize: 16,
    color: "#333"
  }
});
