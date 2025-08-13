import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiPackage,
  FiSettings,
  FiHeadphones,
  FiTrendingUp,
  FiLogOut,
  FiHome,
  FiGlobe,
  FiSearch,
} from "react-icons/fi";

import {
  fetchTickets,
  fetchTicket,
  replyToTicket,
  updateTicketStatus,
  deleteTicket,
} from "../api/supportTickets";

/* ------------ helpers to parse the meta we embed in issue text ------------ */
/*
  We expect issue strings like:

  Subject: Refund for damaged tiles
  Topic: Order Issue
  Country: Canada
  Order: 689a33b2f...
  Contact Email (provided): someone@example.com

  <free-text message...>

  We’ll extract {subject, topic, country, message} and hide the meta from UI.
*/
function parseIssueMeta(issue) {
  const meta = {
    subject: "",
    topic: "",
    country: "",
    contactEmail: "",
    message: "",
  };
  if (!issue || typeof issue !== "string") return meta;

  const lines = issue.split(/\r?\n/);
  const rest = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const m = line.match(/^([^:]+):\s*(.*)$/); // "Key: Value"
    if (m) {
      const key = m[1].toLowerCase();
      const val = m[2].trim();
      if (key.startsWith("subject")) meta.subject = val;
      else if (key.startsWith("topic")) meta.topic = val;
      else if (key.startsWith("country")) meta.country = val;
      else if (key.startsWith("order")) {
        // ignore here; we show real orderId from ticket.orderId
        continue;
      } else if (key.startsWith("contact")) meta.contactEmail = val;
      else rest.push(line);
    } else {
      rest.push(line);
    }
  }

  // collapse remaining lines as a single message paragraph
  meta.message = rest.join(" ").trim();
  return meta;
}

export default function CustomerSupport() {
  const navigate = useNavigate();

  // ---------------- state ----------------
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // filters
  const [status, setStatus] = useState("All");
  const [q, setQ] = useState("");
  const [sortHighFirst, setSortHighFirst] = useState(true);

  // modal + actions
  const [selected, setSelected] = useState(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const replyInputRef = useRef(null);

  // --------------- data load ---------------
  const load = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await fetchTickets({ status, q });
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // client-side sort: High → Medium → Low (optional polish)
  const rows = useMemo(() => {
    if (!sortHighFirst) return tickets;
    const order = { High: 0, Medium: 1, Low: 2 };
    return [...tickets].sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
  }, [tickets, sortHighFirst]);

  // --------------- actions ---------------
  const openTicket = async (id, focusReply = false) => {
    try {
      const full = await fetchTicket(id);
      setSelected(full);
      setReplyMsg("");
      setTimeout(() => {
        if (focusReply && replyInputRef.current) replyInputRef.current.focus();
      }, 0);
    } catch (e) {
      console.error(e);
      alert("Failed to open ticket");
    }
  };

  const handleReply = async () => {
    if (!selected?._id || !replyMsg.trim()) return;
    setActionLoading(true);
    try {
      const updated = await replyToTicket(selected._id, {
        message: replyMsg.trim(),
        //repliedBy: "admin:rudra", // TODO: replace with real admin identity
      });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setReplyMsg("");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Failed to send reply");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    setActionLoading(true);
    try {
      const res = await updateTicketStatus(id, nextStatus);
      if (res && typeof res === "object" && res._id) {
        setTickets((prev) => prev.map((t) => (t._id === res._id ? res : t)));
        if (selected && selected._id === res._id) setSelected(res);
      } else {
        // resolved + archived
        setTickets((prev) => prev.filter((t) => t._id !== id));
        if (selected && selected._id === id) setSelected(null);
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ticket permanently?")) return;
    setActionLoading(true);
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t._id !== id));
      if (selected && selected._id === id) setSelected(null);
    } catch (e) {
      console.error(e);
      alert("Failed to delete ticket");
    } finally {
      setActionLoading(false);
    }
  };

  // --------------- UI helpers ---------------
  const badgeStatus = (value) => {
    const map = {
      Open: "bg-red-100 text-red-700",
      "In Progress": "bg-yellow-100 text-yellow-700",
      Resolved: "bg-green-100 text-green-700",
    };
    return `px-2 py-1 rounded text-xs font-medium ${map[value] || ""}`;
  };

  const badgePriority = (value) => {
    const map = {
      High: "bg-red-50 text-red-700 ring-1 ring-red-200",
      Medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      Low: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    };
    return `px-2 py-1 rounded text-xs font-medium ${map[value] || ""}`;
  };

  const ActionButton = ({ className = "", children, ...props }) => (
    <button
      className={`inline-flex items-center justify-center h-9 px-3 text-sm rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  );

  // --------------- layout ---------------
  return (
    <div className="flex min-h-screen overflow-x-hidden text-gray-800 bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg px-6 py-8 space-y-8">
        <button
          onClick={() => navigate("/admin")}
          className="text-2xl font-bold text-blue-700 flex items-center gap-2 hover:text-blue-900 transition"
        >
          <FiHome /> Admin Panel
        </button>

        <nav className="space-y-4 text-sm">
          <button onClick={() => navigate("/admin/slabs")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiBox /> Slabs Inventory</button>
          <button onClick={() => navigate("/admin/ceramics")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiPackage /> Ceramics Inventory</button>
          <button onClick={() => navigate("/admin/orders")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiSettings /> Orders</button>
          <button onClick={() => navigate("/admin/support")} className="w-full flex items-center gap-3 px-4 py-2 bg-gray-200 rounded-md font-semibold"><FiHeadphones /> Customer Support</button>
          <button onClick={() => navigate("/admin/reports")} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md"><FiTrendingUp /> Sales & Reports</button>
          <button onClick={() => navigate("/", { state: { fromAdmin: true } })} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-green-600"><FiGlobe /> Customer Homepage</button>
          <button onClick={() => { localStorage.removeItem("isAdminLoggedIn"); navigate("/login"); }} className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-100 rounded-md"><FiLogOut /> Logout</button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-8">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-blue-800">Customer Support</h1>
            <p className="text-sm text-gray-500">Track, reply, and resolve customer tickets.</p>
            {errorMsg && <div className="text-red-600 text-sm mt-2">{errorMsg}</div>}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow p-4 mb-5">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm text-gray-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded px-3 py-2 h-9"
              >
                <option>All</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>

              <div className="relative">
                <FiSearch className="absolute left-3 top-[10px] text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && load()}
                  placeholder="Search ticket id, customer, email, issue…"
                  className="border rounded pl-9 pr-3 py-2 h-9 w-80"
                />
              </div>

              <label className="flex items-center gap-2 text-sm ml-2">
                <input
                  type="checkbox"
                  checked={sortHighFirst}
                  onChange={(e) => setSortHighFirst(e.target.checked)}
                />
                High priority first
              </label>

              <ActionButton onClick={load} className="border bg-white hover:bg-gray-50">Apply</ActionButton>
              <ActionButton
                onClick={() => { setStatus("All"); setQ(""); setSortHighFirst(true); load(); }}
                className="border bg-white hover:bg-gray-50"
              >
                Clear
              </ActionButton>
            </div>
          </div>

          {/* Table */}
          <div className="max-w-full overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full table-fixed text-sm text-left text-gray-700">
              <colgroup>
                <col style={{ width: "140px" }} />
                <col style={{ width: "230px" }} />
                <col style={{ width: "auto" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "170px" }} />
                <col style={{ width: "320px" }} />
              </colgroup>

              <thead className="bg-blue-50 text-gray-700 text-xs uppercase sticky top-0">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Issue</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td className="p-6 text-gray-500" colSpan={7}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td className="p-6 text-gray-500" colSpan={7}>No tickets found.</td></tr>
                ) : (
                  rows.map((t) => {
                    const parsed = parseIssueMeta(t.issue);
                    return (
                      <tr key={t._id} className="border-t align-top">
                        <td className="py-3 px-4 font-medium whitespace-nowrap">
                          {t.ticketId || t._id.slice(-6)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{t.customerSnapshot?.name || "Unknown"}</div>
                          <div className="text-gray-500 truncate">{t.customerSnapshot?.email || ""}</div>
                        </td>
                        <td className="py-3 px-4">
                          {/* show only the message (meta removed) */}
                          <div className="leading-5 max-h-[3.2rem] overflow-hidden">
                            {parsed.message || t.issue}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={badgePriority(t.priority)}>{t.priority}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={badgeStatus(t.status)}>{t.status}</span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <ActionButton
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() => openTicket(t._id, false)}
                              >
                                View
                              </ActionButton>
                              <ActionButton
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={() => openTicket(t._id, true)}
                              >
                                Reply
                              </ActionButton>
                              <ActionButton
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => handleDelete(t._id)}
                                disabled={actionLoading}
                              >
                                Delete
                              </ActionButton>
                            </div>
                            <select
                              className="border rounded h-9 px-2 text-sm w-[130px]"
                              value={t.status}
                              onChange={(e) => handleStatusChange(t._id, e.target.value)}
                              disabled={actionLoading}
                            >
                              <option>Open</option>
                              <option>In Progress</option>
                              <option>Resolved</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-3xl rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Ticket {selected.ticketId || selected._id?.slice(-6)}
                </h3>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-800">✕</button>
              </div>

              {/* parse meta for the selected ticket */}
              {(() => {
                const meta = parseIssueMeta(selected.issue);
                return (
                  <>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <div className="font-medium mb-1">Customer</div>
                        <div>{selected.customerSnapshot?.name || "Unknown"}</div>
                        <div className="text-gray-500">{selected.customerSnapshot?.email}</div>
                        <div className="text-gray-500">{selected.customerSnapshot?.phone}</div>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Details</div>
                        {meta.subject && (
                          <div><span className="text-gray-500">Subject:</span> {meta.subject}</div>
                        )}
                        {meta.topic && (
                          <div><span className="text-gray-500">Topic:</span> {meta.topic}</div>
                        )}
                        {meta.country && (
                          <div><span className="text-gray-500">Country:</span> {meta.country}</div>
                        )}
                        <div><span className="text-gray-500">Priority:</span> {selected.priority}</div>
                        <div><span className="text-gray-500">Status:</span> {selected.status}</div>

                        {selected.orderId && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-500">Order Number:</span>
                            <span className="font-mono text-sm">
                              {String(selected.orderId).slice(0, 6)}…{String(selected.orderId).slice(-5)}
                            </span>
                            <button
                              className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                              onClick={() => navigator.clipboard.writeText(String(selected.orderId))}
                            >
                              Copy
                            </button>
                            <button
                              className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                              onClick={() => navigate(`/admin/orders?oid=${selected.orderId}`)}
                            >
                              Open
                            </button>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Created:</span>{" "}
                          {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-medium">Issue</div>
                      <div className="border rounded p-3 bg-gray-50">
                        {meta.message || selected.issue}
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="space-y-2 max-h-56 overflow-auto">
                <div className="font-medium">Conversation</div>
                <div className="space-y-2">
                  {selected.replies?.length ? (
                    selected.replies.map((r, idx) => (
                      <div key={idx} className="border rounded p-3">
                        <div className="text-xs text-gray-500 mb-1">
                          {r.repliedBy} • {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                        </div>
                        <div>{r.message}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No replies yet.</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={replyInputRef}
                  value={replyMsg}
                  onChange={(e) => setReplyMsg(e.target.value)}
                  placeholder="Type your reply…"
                  className="flex-1 border rounded px-3 py-2 h-10"
                />
                <ActionButton
                  onClick={handleReply}
                  className="border bg-white hover:bg-gray-50"
                  disabled={!replyMsg.trim() || actionLoading}
                >
                  Send
                </ActionButton>
                <select
                  className="ml-2 border rounded h-10 px-2 text-sm"
                  value={selected.status}
                  onChange={(e) => handleStatusChange(selected._id, e.target.value)}
                  disabled={actionLoading}
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
