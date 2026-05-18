import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { UserContext } from "../contextAPI/UserContext";
import UserRepository from "../repository/User";
import { api } from "../connection/api";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
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
                    setPhotoUri(userInfo.profile_picture || undefined);
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

            // FIX: inferir MIME type pela extensão para garantir funcionamento no APK release
            const uriParts = imageAsset.uri.split(".");
            const extension = uriParts[uriParts.length - 1]?.toLowerCase() || "jpg";
            const mimeType = extension === "png" ? "image/png" : "image/jpeg";

            const fileObject = {
                uri: imageAsset.uri,
                type: mimeType,
                name: imageAsset.uri.split("/").pop() || `photo.${extension}`,
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
                formData.append("profile_picture", photo);
            }
            formData.append("name", name.trim());
            formData.append("bio", bio.trim());

            const response = await api().put("/atualizar-usuario/" + loggedUser.getId(), formData, {
                headers: { "Content-Type": "multipart/form-data" },
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
            Toast.show({ type: "error", text1: "Erro ao atualizar" });
        } finally {
            setLoading(false);
        }
    };

    const confirmLogout = async () => {
        Alert.alert(
            "Confirmação de Logout",
            "Você tem certeza que deseja sair?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", style: "destructive", onPress: logout },
            ]
        );
    };

    const logout = async () => {
        setLoading(true);
        try {
            await userRepository.clearUser();
            Toast.show({ type: "success", text1: "Deslogado com sucesso!" });
            router.replace("/");
        } catch (error) {
            console.log("Erro ao deslogar:", error);
        } finally {
            setLoading(false);
        }
    };

    const initials = name ? name.charAt(0).toUpperCase() : "?";

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Text style={styles.headerTitle}>Meu Perfil</Text>
                <Text style={styles.headerSubtitle}>Atualize suas informações</Text>
            </View>

            {/* Avatar */}
            <View style={styles.avatarSection}>
                <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={styles.avatarWrapper}>
                    {photoUri ? (
                        <Image
                            source={{ uri: photoUri }}
                            style={styles.avatarImage}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    )}
                    <View style={styles.avatarBadge}>
                        <Text style={styles.avatarBadgeText}>✎</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
                    <Text style={styles.changePhotoText}>Alterar foto</Text>
                </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Digite seu nome"
                            placeholderTextColor="#c9a0b8"
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={email}
                            editable={false}
                            placeholderTextColor="#c9a0b8"
                        />
                        <Text style={styles.helperText}>O email não pode ser alterado</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Conte um pouco sobre você..."
                            placeholderTextColor="#c9a0b8"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.buttonDisabled]}
                    onPress={updateProfile}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Salvar Perfil</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.logoutButton, loading && styles.buttonDisabled]}
                    onPress={confirmLogout}
                    disabled={loading}
                    activeOpacity={0.7}
                >
                    <Text style={styles.logoutButtonText}>Sair da conta</Text>
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
    header: {
        backgroundColor: "#d63384",
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#fff",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.75)",
        fontWeight: "500",
    },
    avatarSection: {
        alignItems: "center",
        marginTop: -36,
        marginBottom: 24,
    },
    avatarWrapper: {
        position: "relative",
        marginBottom: 10,
    },
    avatarImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: "#fff",
    },
    avatarPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#d63384",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "#fff",
        shadowColor: "#d63384",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
    avatarText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 40,
    },
    avatarBadge: {
        position: "absolute",
        bottom: 2,
        right: 2,
        backgroundColor: "#ff80b5",
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    avatarBadgeText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },
    changePhotoText: {
        color: "#d63384",
        fontSize: 14,
        fontWeight: "600",
    },
    form: {
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        shadowColor: "#d63384",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        marginBottom: 20,
    },
    inputGroup: {
        paddingVertical: 14,
    },
    divider: {
        height: 1,
        backgroundColor: "#f5e6ef",
    },
    label: {
        fontSize: 12,
        fontWeight: "700",
        color: "#d63384",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 8,
    },
    input: {
        fontSize: 15,
        color: "#333",
        padding: 0,
    },
    inputDisabled: {
        color: "#aaa",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    helperText: {
        fontSize: 11,
        color: "#bbb",
        marginTop: 4,
        fontStyle: "italic",
    },
    saveButton: {
        backgroundColor: "#d63384",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        shadowColor: "#d63384",
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
        marginBottom: 12,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    logoutButton: {
        backgroundColor: "transparent",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#d63384",
    },
    logoutButtonText: {
        color: "#d63384",
        fontSize: 16,
        fontWeight: "600",
    },
    buttonDisabled: {
        opacity: 0.55,
    },
});
