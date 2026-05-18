import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { api } from "./connection/api";
import UserModel from "./models/User";
import UserRepository from "./repository/User";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      const response = await api().post("login", { email, password });
      if (response.data.success) {
        const userResponse = response.data.user;
        const user = new UserModel();
        user.setId(userResponse.id);
        user.setName(userResponse.name);
        user.setEmail(userResponse.email);
        await new UserRepository().updateUser(user);
        router.push("/conversations");
      } else {
        Toast.show({ type: "danger", text1: "Erro ao logar usuário.", text2: response.data.msg });
      }
    } catch (e) {
      console.error("Error logging in user:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Brand */}
      <View style={styles.brandArea}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>💬</Text>
        </View>
        <Text style={styles.title}>GirlsChat</Text>
        <Text style={styles.subtitle}>Onde as conversas criam laços</Text>
      </View>

      {/* Form card */}
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#c9a0b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#c9a0b8"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonPrimaryText}>{loading ? "Entrando..." : "Entrar"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => router.push("/register")}
        activeOpacity={0.7}
      >
        <Text style={styles.registerLinkText}>
          Não tem conta?{" "}
          <Text style={styles.registerLinkBold}>Cadastre-se</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffe6f0",
    padding: 24,
  },
  brandArea: {
    alignItems: "center",
    marginBottom: 36,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#d63384",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#d63384",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  iconEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#d63384",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#b07090",
    fontWeight: "500",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#d63384",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#f5c0d8",
    backgroundColor: "#fff5f9",
    padding: 14,
    marginBottom: 14,
    borderRadius: 14,
    fontSize: 15,
    color: "#333",
  },
  buttonPrimary: {
    backgroundColor: "#d63384",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#d63384",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  registerLink: {
    padding: 8,
  },
  registerLinkText: {
    color: "#b07090",
    fontSize: 14,
    fontWeight: "500",
  },
  registerLinkBold: {
    color: "#d63384",
    fontWeight: "700",
  },
});
