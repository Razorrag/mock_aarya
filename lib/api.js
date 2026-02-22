const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8001";
const AUTH_BYPASS =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") ||
  false;

export function getApiBase() {
  return API_BASE.replace(/\/+$/, "");
}

function getMockUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("mock_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setMockUser(user) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("mock_user", JSON.stringify(user));
  } catch {
    // ignore
  }
}

function buildMockAuthResponse() {
  return {
    user: {
      id: 1,
      email: "dev@example.com",
      username: "devuser",
      full_name: "Dev User",
      role: "customer",
      is_active: true,
      email_verified: true,
      phone_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    },
    tokens: {
      access_token: "dev_access_token",
      refresh_token: "dev_refresh_token",
      token_type: "bearer",
      expires_in: 3600,
    },
    session_id: "dev_session_id",
  };
}

function mockAuth(path, options) {
  const method = (options.method || "GET").toUpperCase();

  if (path.startsWith("/api/v1/auth/login") && method === "POST") {
    const payload = buildMockAuthResponse();
    setMockUser(payload.user);
    return payload;
  }
  if (path.startsWith("/api/v1/auth/register") && method === "POST") {
    const payload = buildMockAuthResponse();
    setMockUser(payload.user);
    return payload.user;
  }
  if (path.startsWith("/api/v1/auth/forgot-password")) {
    return { detail: "Password reset link sent (mock)." };
  }
  if (path.startsWith("/api/v1/auth/reset-password")) {
    return { detail: "Password reset successful (mock)." };
  }
  if (path.startsWith("/api/v1/auth/send-otp")) {
    return {
      success: true,
      message: "OTP sent (mock).",
      expires_in: 600,
      otp_type: "EMAIL",
    };
  }
  if (path.startsWith("/api/v1/auth/resend-otp")) {
    return {
      success: true,
      message: "OTP resent (mock).",
      expires_in: 600,
      otp_type: "EMAIL",
    };
  }
  if (path.startsWith("/api/v1/auth/verify-otp")) {
    return {
      success: true,
      message: "OTP verified (mock).",
      verified: true,
    };
  }
  if (path.startsWith("/api/v1/auth/change-password")) {
    return { detail: "Password changed (mock)." };
  }
  if (path.startsWith("/api/v1/auth/verify-reset-token")) {
    return { valid: true, email: "dev@example.com" };
  }
  if (path.startsWith("/api/v1/users/me")) {
    const user = getMockUser();
    if (!user) {
      const payload = buildMockAuthResponse();
      setMockUser(payload.user);
      return payload.user;
    }
    return user;
  }

  return null;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text ? { detail: text } : {};
}

export async function apiFetch(path, options = {}) {
  if (AUTH_BYPASS) {
    const mock = mockAuth(path, options);
    if (mock !== null) {
      return mock;
    }
  }

  const url = `${getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const detail =
      (data && (data.detail || data.message)) ||
      `Request failed with status ${response.status}`;
    const error = new Error(detail);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
