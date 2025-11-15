import React, { useContext, useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert
} from "react-native";
import { UserContext } from "../contextAPI/UserContext";
import UserRepository from "../repository/User";
import { api } from "../connection/api";
import Toast from "react-native-toast-message";
import * as ImagePicker from 'expo-image-picker';
import UserModel from "../models/User";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [photo, setPhoto] = useState<any>(undefined);
    const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const userRepository = new UserRepository();

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await userRepository.getUser();
            if (userData) {
                const responseUser = await api().get("/usuario/" + userData.getId());
                if (responseUser.data.success) {
                    const userInfo = responseUser.data.user;
                    setName(userInfo.name || "");
                    setEmail(userInfo.email || "");
                    setBio(userInfo.bio || "");
                    setPhotoUri(userInfo.profile_picture || "");
                    alert(userInfo.profile_picture);
                } else {
                    throw new Error(responseUser.data.msg || "Erro ao carregar dados do usuário");
                }
            }
        } catch (error) {
            console.log("Erro ao carregar dados do usuário:", error);
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permissão necessária", "É necessário permitir acesso à galeria para selecionar uma foto.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const imageAsset = result.assets[0];
            
            const fileObject = {
                uri: imageAsset.uri,
                type: imageAsset.type,
                name: imageAsset.uri.split('/').pop() || 'photo.jpg',
            };
            
            setPhoto(fileObject as any);
            setPhotoUri(imageAsset.uri);
        }
    };

    const updateProfile = async () => {
        const loggedUser = await userRepository.getUser();
        if (!name.trim()) {
            Toast.show({
                type: "error",
                text1: "Nome obrigatório",
                text2: "Por favor, preencha seu nome",
            });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            if (photo) {
                alert("Enviando foto");
                formData.append("profile_picture", photo);
            }
            formData.append("name", name.trim());
            formData.append("bio", bio.trim());

            const response = await api().put("/atualizar-usuario/" + loggedUser.getId(), formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.data.success) {
                const updatedUser = new UserModel();
                updatedUser.setId(loggedUser.getId());
                updatedUser.setName(name.trim());
                userRepository.updateUser(updatedUser);

                Toast.show({
                    type: "success",
                    text1: "Perfil atualizado!",
                    text2: "Suas informações foram salvas com sucesso",
                });
            } else {
                throw new Error(response.data.msg || "Erro ao atualizar perfil");
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Erro ao atualizar"
            });
        } finally {
            setLoading(false);
        }
    };

    const confirmLogout = async () => {
        Alert.alert(
            "Confirmação de Logout",
            "Você tem certeza que deseja sair?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                    onPress: () => {}
                },
                {
                    text: "Sair",
                    style: "destructive",
                    onPress: () => logout()
                }
            ]
        );
    };

    const logout = async () => {
        setLoading(true);
        try {
            await userRepository.clearUser();
            Toast.show({
                type: "success",
                text1: "Deslogado com sucesso!",
            });
            router.replace("/");
        } catch (error) {
            console.log("Erro ao deslogar:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Meu Perfil</Text>

            <View style={styles.avatarContainer}>
                <TouchableOpacity style={styles.avatar} onPress={pickImage}>
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>
                            {name ? name.charAt(0).toUpperCase() : "?"}
                        </Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={pickImage}>
                    <Text style={styles.changePhotoText}>Alterar foto</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nome *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Digite seu nome"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, styles.inputDisabled]}
                        value={email}
                        editable={false}
                        placeholderTextColor="#999"
                    />
                    <Text style={styles.helperText}>O email não pode ser alterado</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Conte um pouco sobre você..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={updateProfile}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {loading ? "Salvando..." : "Salvar Perfil"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.logoutButton, loading && styles.logoutButtonDisabled, { marginBottom: 40 + insets.bottom }]}
                    onPress={confirmLogout}
                    disabled={loading}
                >
                    <Text style={styles.logoutButtonText}>
                        {loading ? "Salvando..." : "Sair"}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffe6f0",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#d63384",
        textAlign: "center",
        marginTop: 50,
        marginBottom: 30,
    },
    avatarContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#d63384",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    avatarImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    avatarText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 40,
    },
    changePhotoText: {
        color: "#d63384",
        fontSize: 16,
        fontWeight: "600",
    },
    form: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        borderWidth: 2,
        borderColor: "#f0f0f0",
        color: "#333",
    },
    inputDisabled: {
        backgroundColor: "#f5f5f5",
        color: "#666",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    helperText: {
        fontSize: 12,
        color: "#999",
        marginTop: 5,
        fontStyle: "italic",
    },
    saveButton: {
        backgroundColor: "#d63384",
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    logoutButton: {
        backgroundColor: "transparent",
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    saveButtonDisabled: {
        backgroundColor: "#999",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    logoutButtonDisabled: {
        backgroundColor: "#999",
    },
    logoutButtonText: {
        color: "#d63384",
        fontSize: 18,
        fontWeight: "700",
    },
});