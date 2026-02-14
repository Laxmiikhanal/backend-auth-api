"use server";

export async function handleLogin(body: { email: string; password: string }) {
  const res = await fetch("http://localhost:5050/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, message: data?.message || "Login failed" };
  }

  return {
    success: true,
    message: data?.message || "Login success",
    token: data?.token,
    data: data?.data, // user object
  };
}
        