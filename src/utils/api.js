const API = import.meta.env.VITE_API_URL 

function getToken() {
  try {
    const sesion = JSON.parse(localStorage.getItem("uajs_session") || "null");
    return sesion?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
  return json.data;
}

// Helpers por dominio — añade según necesidades
export const authApi = {
  login: (identificacion, password) =>
    apiFetch("/auth/login", { method: "POST", body: { identificacion, password } }),
  me: () => apiFetch("/auth/me")
};

export const resourcesApi = {
  list: () => apiFetch("/resources"),
  create: (r) => apiFetch("/resources", { method: "POST", body: r }),
  update: (id, r) => apiFetch(`/resources/${id}`, { method: "PUT", body: r }),
  remove: (id) => apiFetch(`/resources/${id}`, { method: "DELETE" })
};