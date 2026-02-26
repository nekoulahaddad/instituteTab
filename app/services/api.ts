import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = (global as any).BASE_URL || "http://localhost:3000";

export async function registerUser(payload: any) {
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Registration failed");
  }

  const data = await res.json();

  // If backend returns token or user, store minimal user
  if (data.user) {
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
  } else if (data.id) {
    await AsyncStorage.setItem("user", JSON.stringify(data));
  }

  return data;
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export async function saveStoredUser(user: any) {
  await AsyncStorage.setItem("user", JSON.stringify(user));
}
