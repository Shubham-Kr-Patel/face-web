import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const registerFace = (data) => API.post("/register", data);
export const recognizeFace = (data) => API.post("/recognize", data);