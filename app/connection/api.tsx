import axios from "axios";
import UserRepository from "../repository/User";
import { usePushNotifications } from "../providers/usePushNotifications";

export const apiURL = "http://192.168.0.11:3333";

export function api() {
  // const config: any = { baseURL: apiURL };
  // const userLogged = new UserRepository().getUser();
  // const { expoPushToken } = usePushNotifications();
  // return userLogged.then((user) => {
  //   if (user) {
  //     config.headers = {
  //       "expo-notification-token": expoPushToken,
  //       "expo-notification-id": user.getId(),
  //     };
  //   }
  // }).finally(() => {
  //   return axios.create(config);
  // });
  return axios.create({ baseURL: apiURL }); 
}