import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE}/api/supporttickets`,
});

export const createTicket = (payload) =>
  api.post("/", payload).then((r) => r.data);
