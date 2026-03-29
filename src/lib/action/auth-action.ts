// export type LoginBody = {
//   email: string;
//   password: string;
// };

// export type LoginUser = {
//   _id: string;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   role?: string;
//   imageUrl?: string;
// };

// export type LoginResult = {
//   success: boolean;
//   message: string;
//   token: string;
//   user: LoginUser | null;
// };

// const API_BASE =
//   process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:5051";

// export async function handleLogin(body: LoginBody): Promise<LoginResult> {
//   try {
//     const res = await fetch(`${API_BASE}/api/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//       cache: "no-store",
//     });

//     const data = await res.json().catch(() => null);

//     if (!res.ok) {
//       return {
//         success: false,
//         message: data?.message || "Login failed",
//         token: "",
//         user: null,
//       };
//     }

//     // Backend shape usually:
//     // {
//     //   success: true,
//     //   message: "...",
//     //   data: {
//     //     user: {...},
//     //     accessToken: "...",
//     //     refreshToken: "..."
//     //   }
//     // }

//     const payload = data?.data || {};

//     const token =
//       payload?.accessToken ||
//       payload?.token ||
//       data?.token ||
//       "";

//     const rawUser =
//       payload?.user ||
//       data?.user ||
//       null;

//     const user: LoginUser | null = rawUser
//       ? {
//           _id: String(rawUser._id || rawUser.id || ""),
//           firstName: rawUser.firstName || "",
//           lastName: rawUser.lastName || "",
//           email: rawUser.email || "",
//           role: rawUser.role || "user",
//           imageUrl: rawUser.imageUrl || "",
//         }
//       : null;

//     return {
//       success: true,
//       message: data?.message || "Login successful",
//       token,
//       user,
//     };
//   } catch (error: any) {
//     return {
//       success: false,
//       message: error?.message || "Login failed",
//       token: "",
//       user: null,
//     };
//   }
// }

export type LoginBody = {
  email: string;
  password: string;
};

export type LoginUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  imageUrl?: string;
};

export type LoginResult = {
  success: boolean;
  message: string;
  token: string;
  user: LoginUser | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:5051";

export async function handleLogin(body: LoginBody): Promise<LoginResult> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Login failed",
        token: "",
        user: null,
      };
    }

    const payload = data?.data || {};

    const token = payload?.accessToken || payload?.token || data?.token || "";

    const rawUser = payload?.user || data?.user || null;

    const user: LoginUser | null = rawUser
      ? {
          _id: String(rawUser._id || rawUser.id || ""),
          firstName: rawUser.firstName || "",
          lastName: rawUser.lastName || "",
          email: rawUser.email || "",
          role: rawUser.role || "user",
          imageUrl: rawUser.imageUrl || "",
        }
      : null;

    return {
      success: true,
      message: data?.message || "Login successful",
      token,
      user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Login failed",
      token: "",
      user: null,
    };
  }
}