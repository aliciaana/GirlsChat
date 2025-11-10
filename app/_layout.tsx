import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ToastProvider } from 'react-native-toast-notifications';

import { useColorScheme } from '@/hooks/useColorScheme';
import { UserContext, UserProvider } from './contextAPI/UserContext';
import { useContext, useEffect } from 'react';
import UserRepository from './repository/User';
import { usePushNotifications } from './providers/usePushNotifications';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { userLogged, setUserLogged } = useContext(UserContext);
  const { notification } = usePushNotifications();
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const userData = await new UserRepository().getUser();
      setUserLogged(userData);
    } catch (error) {
      console.log('Usuário não encontrado, redirecionando para login');
      router.replace('/');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (notification) {
      const chatID = notification.request.content.data?.chatID;
      const otherUserID = notification.request.content.data?.otherUserID;

      if (chatID && otherUserID) {
        router.push(`/chat?id=${chatID}&otherID=${otherUserID}`);
      }
    }
  }, [notification]);

  return (
    <UserProvider>
      <ToastProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ToastProvider>
    </UserProvider>
  );
}
