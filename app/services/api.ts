import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = (global as any).BASE_URL || "http://192.168.0.103:3000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export async function registerUser(payload: any) {
  try {
    console.log("Registering user with payload:", payload, BASE_URL);
    const response = await api.post("/registration", payload);
    console.log("Registration response:", response.data);

    // If backend returns token or user, store minimal user
    if (response.data.user) {
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    } else if (response.data.id) {
      await AsyncStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error: any) {
    console.error("Registration error:", error);
    const message =
      error.response?.data?.message || error.message || "Registration failed";
    throw new Error(message);
  }
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export async function saveStoredUser(user: any) {
  await AsyncStorage.setItem("user", JSON.stringify(user));
}

export async function findUserByPhone(phone: string) {
  try {
    const response = await api.get(`/users/find-by-phone/${phone}`);
    return response.data;
  } catch (error: any) {
    console.error("Find user by phone error:", error);
    const message =
      error.response?.data?.message || error.message || "User not found";
    throw new Error(message);
  }
}
