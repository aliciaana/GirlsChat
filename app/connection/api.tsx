import axios from "axios";

export const apiURL = "http://localhost:3333";

export function api() {
  return axios.create({ baseURL: apiURL }); 
}