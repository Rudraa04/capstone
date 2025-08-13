import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE}/api/supporttickets`,
});

// LIST (supports status + q from the page)
export const fetchTickets = (params = {}) =>
  api.get("/", { params }).then((r) => r.data);

export const fetchTicket = (id) => api.get(`/${id}`).then((r) => r.data);
export const replyToTicket = (id, payload) => api.post(`/${id}/reply`, payload).then((r) => r.data);
export const updateTicketStatus = (id, status) => api.patch(`/${id}/status`, { status }).then((r) => r.data);
export const deleteTicket = (id) => api.delete(`/${id}`).then((r) => r.data);

export default {
  fetchTickets,
  fetchTicket,
  replyToTicket,
  updateTicketStatus,
  deleteTicket,
};