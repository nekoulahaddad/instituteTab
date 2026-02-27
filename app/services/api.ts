import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = (global as any).BASE_URL || "http://192.168.0.103:3000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export type LocalizedText = {
  ar: string;
  en: string;
};

export type InstituteNews = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  category: LocalizedText;
  imageUrl?: string;
  publishedAt: string;
};

const mockLatestNews: InstituteNews[] = [
  {
    id: "news-1",
    title: {
      en: "Spring Semester Registration Is Open",
      ar: "فتح التسجيل للفصل الدراسي الربيعي",
    },
    summary: {
      en: "Students can now register online until March 10. Late requests will require academic approval.",
      ar: "يمكن للطلاب التسجيل إلكترونيا حتى 10 مارس. الطلبات المتأخرة تحتاج موافقة أكاديمية.",
    },
    category: {
      en: "Announcements",
      ar: "إعلانات",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1280&q=80",
    publishedAt: "2026-02-24T09:00:00.000Z",
  },
  {
    id: "news-2",
    title: {
      en: "AI Lab Workshop for New Students",
      ar: "ورشة معمل الذكاء الاصطناعي للطلاب الجدد",
    },
    summary: {
      en: "A practical workshop will be held in Hall B this Tuesday at 12:00 PM.",
      ar: "ستقام ورشة تطبيقية في القاعة B يوم الثلاثاء الساعة 12:00 ظهرا.",
    },
    category: {
      en: "Events",
      ar: "فعاليات",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1280&q=80",
    publishedAt: "2026-02-22T08:30:00.000Z",
  },
  {
    id: "news-3",
    title: {
      en: "Library Extends Evening Hours",
      ar: "تمديد ساعات عمل المكتبة المسائية",
    },
    summary: {
      en: "The central library will stay open until 9:00 PM during exam preparation weeks.",
      ar: "ستبقى المكتبة المركزية مفتوحة حتى 9:00 مساء خلال أسابيع التحضير للامتحانات.",
    },
    category: {
      en: "Campus",
      ar: "الحرم",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1280&q=80",
    publishedAt: "2026-02-20T15:45:00.000Z",
  },
];

export async function getLatestNews(): Promise<InstituteNews[]> {
  try {
    const response = await api.get("/news/latest");
    const raw = response.data;

    if (Array.isArray(raw)) {
      return raw;
    }

    if (Array.isArray(raw?.data)) {
      return raw.data;
    }

    if (Array.isArray(raw?.items)) {
      return raw.items;
    }

    return [];
  } catch (error: any) {
    console.warn(
      "Latest news endpoint is not available yet, falling back to mock news.",
      error?.message,
    );
    return mockLatestNews;
  }
}

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
