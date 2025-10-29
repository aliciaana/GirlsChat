import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import UserModel from "./models/User";
import UserRepository from "./repository/User";
import { useToast } from "react-native-toast-notifications";
import { api } from "./connection/api";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  async function handleRegister() {
    const response = await api().post("criar-usuario", {
      name,
      email,
      password,
    });
    
    if (response.data.success) {
      const userResponse = response.data.user;
      const user = new UserModel();
      user.setId(userResponse.id);
      user.setName(userResponse.name);
      user.setEmail(userResponse.email);
      await new UserRepository().updateUser(user);
      toast.show("Usuário criado com sucesso!", { type: "success" });
      router.push("/");
    } else {
      toast.show("Erro ao criar usuário. " + response.data.msg, { type: "danger" });
      console.error("Error creating user:", response.data.msg);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GirlsChat</Text>
      <Text style={styles.subtitle}>Crie sua conta e comece a conversar ✨</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.buttonPink} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonGray} onPress={() => router.push("/")}>
        <Text style={styles.buttonText}>Voltar ao Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#ffe6f0", 
    padding: 20 
  },
  title: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: "#d63384", 
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 16, 
    color: "#555", 
    marginBottom: 30,
    textAlign: "center"
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff"
  },
  buttonPink: {
    width: "100%",
    backgroundColor: "#ff80b5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  buttonGray: {
    width: "100%",
    backgroundColor: "#bfbfbf",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  }
});

