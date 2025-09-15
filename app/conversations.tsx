import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Conv = {
  id: string;
  name: string;
};

const DATA: Conv[] = [
  { id: "1", name: "Maria Silva" },
  { id: "2", name: "Mariana Melo" },
  { id: "3", name: "Ana Clara" },
  { id: "4", name: "Beatriz" },
];

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

  const renderItem = ({ item }: { item: Conv }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/chat?id=${item.id}&name=${encodeURIComponent(item.name)}`)}
    >
      <Avatar name={item.name} />
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Conversas</Text>

      <FlatList
        data={DATA}
        keyExtractor={(i) => i.id}
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
