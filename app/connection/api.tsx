import axios from "axios";

export const apiURL = "http://192.168.0.11:3333";

export function api() {
  return axios.create({ baseURL: apiURL }); 
}