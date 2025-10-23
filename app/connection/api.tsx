import axios from "axios";

const apiURL = "http://localhost:3333";

export default function api() {
  return axios.create({ baseURL: apiURL });
}