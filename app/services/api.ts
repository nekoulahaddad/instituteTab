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
    await AsyncStorage.removeItem("user");
    const response = await api.get(`/users/find-by-phone/${phone}`);
    return response.data;
  } catch (error: any) {
    console.error("Find user by phone error:", error);
    const message =
      error.response?.data?.message || error.message || "User not found";
    throw new Error(message);
  }
}

export async function updateRegistration(id: string, payload: any) {
  try {
    console.log("Updating registration with ID:", id, "payload:", payload);
    const response = await api.patch(`/registration/${id}`, payload);
    console.log("Update registration response:", response.data);

    // Update stored user
    if (response.data.user) {
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    } else if (response.data.id || response.data._id) {
      await AsyncStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch (error: any) {
    console.error("Update registration error:", error);
    const message =
      error.response?.data?.message || error.message || "Update failed";
    throw new Error(message);
  }
}

// authentication/otp helpers
// NOTE: backend endpoints need to be implemented accordingly. Two suggested routes:
//   POST /auth/send-code   body { phone: string }
//     -> generates a numeric code, sends via WhatsApp
//   POST /auth/verify-code body { phone: string, code: string }
//     -> checks code, returns user object if valid (existing or newly created)

export async function sendVerificationCode(phone: string) {
  try {
    const response = await api.post(`/auth/send-code`, { phone });
    return response.data; // maybe returns { success: true }
  } catch (error: any) {
    console.error("Send verification code error:", error);
    const message =
      error.response?.data?.message || error.message || "Failed to send code";
    throw new Error(message);
  }
}

export async function verifyCode(phone: string, code: string) {
  try {
    const response = await api.post(`/auth/verify-code`, { phone, code });
    // expected to receive { user: {...} }
    if (response?.data?.user) {
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error: any) {
    console.error("Verify code error:", error);
    const message =
      error.response?.data?.message || error.message || "Failed to verify code";
    throw new Error(message);
  }
}
