"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  admin_reply: string | null;
  replied_at: string | null;
}

export default function ContactsPage() {
  const supabase = createClient();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "replied">("all");
  const [search, setSearch] = useState("");
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts() {
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    setContacts(data || []);
  }

  async function openMessage(contact: Contact) {
    setSelected(contact);
    setReply(contact.admin_reply || "");

    if (!contact.is_read) {
      await supabase
        .from("contacts")
        .update({ is_read: true })
        .eq("id", contact.id);
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? { ...c, is_read: true } : c))
      );
    }
  }

  async function toggleRead(contact: Contact) {
    const newVal = !contact.is_read;
    await supabase
      .from("contacts")
      .update({ is_read: newVal })
      .eq("id", contact.id);
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, is_read: newVal } : c))
    );
    if (selected?.id === contact.id) {
      setSelected({ ...contact, is_read: newVal });
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contacts").delete().eq("id", id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);

    try {
      const res = await fetch("/api/contact-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: selected.id,
          toEmail: selected.email,
          toName: selected.name,
          subject: selected.subject,
          reply: reply.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send");
      }

      const now = new Date().toISOString();
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selected.id
            ? { ...c, admin_reply: reply.trim(), replied_at: now, is_read: true }
            : c
        )
      );
      setSelected({
        ...selected,
        admin_reply: reply.trim(),
        replied_at: now,
        is_read: true,
      });
    } catch (err: any) {
      alert("Failed to send reply: " + err.message);
    }

    setSending(false);
  }

  const filtered = contacts.filter((c) => {
    if (filter === "unread" && c.is_read) return false;
    if (filter === "replied" && !c.admin_reply) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        (c.subject || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const unread = contacts.filter((c) => !c.is_read).length;

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-1 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Messages
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {contacts.length} message{contacts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {unread > 0 && (
          <span className="text-xs font-semibold text-white bg-[#d41920] px-3 py-1.5 rounded-full">
            {unread} unread
          </span>
        )}
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Left: Message List */}
        <div className="w-[380px] shrink-0 border-r border-zinc-200/60 flex flex-col">
          {/* Search + Filter */}
          <div className="p-3 border-b border-zinc-100 space-y-2">
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d41920]/20 focus:border-[#d41920]/40"
            />
            <div className="flex gap-1">
              {(["all", "unread", "replied"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filter === f
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-500 hover:bg-zinc-100"
                  }`}
                >
                  {f === "all"
                    ? `All (${contacts.length})`
                    : f === "unread"
                    ? `Unread (${unread})`
                    : `Replied (${contacts.filter((c) => c.admin_reply).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-sm">No messages found</p>
              </div>
            ) : (
              filtered.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => openMessage(contact)}
                  className={`px-4 py-3.5 border-b border-zinc-100 cursor-pointer transition-colors ${
                    selected?.id === contact.id
                      ? "bg-zinc-100"
                      : !contact.is_read
                      ? "bg-blue-50/40 hover:bg-blue-50/60"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {!contact.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#d41920] shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          !contact.is_read
                            ? "font-bold text-zinc-900"
                            : "font-medium text-zinc-700"
                        }`}
                      >
                        {contact.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 shrink-0">
                      {timeAgo(contact.created_at)}
                    </span>
                  </div>
                  <p
                    className={`text-xs mb-1 ${
                      !contact.is_read
                        ? "font-semibold text-zinc-700"
                        : "font-medium text-zinc-500"
                    }`}
                  >
                    {contact.subject || "No subject"}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">
                    {contact.message}
                  </p>
                  {contact.admin_reply && (
                    <span className="inline-block mt-1.5 text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                      Replied
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Message Detail */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-zinc-200 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-zinc-400 text-sm">
                  Select a message to read
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Message Header */}
              <div className="px-6 py-4 border-b border-zinc-100 shrink-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-zinc-900 truncate">
                      {selected.subject || "No subject"}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {selected.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-800">
                          {selected.name}
                        </p>
                        <p className="text-xs text-zinc-400">{selected.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <button
                      onClick={() => toggleRead(selected)}
                      className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                      title={selected.is_read ? "Mark as unread" : "Mark as read"}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={selected.is_read ? "none" : "currentColor"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteMessage(selected.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  {new Date(selected.created_at).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Message Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="whitespace-pre-wrap text-sm text-zinc-700 leading-relaxed">
                  {selected.message}
                </div>

                {/* Admin Reply (if exists) */}
                {selected.admin_reply && (
                  <div className="mt-6 border-t border-zinc-100 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-[#d41920] text-white flex items-center justify-center text-[10px] font-bold">
                        E
                      </div>
                      <span className="text-xs font-semibold text-zinc-600">
                        EUROFILES
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {selected.replied_at && timeAgo(selected.replied_at)}
                      </span>
                    </div>
                    <div className="bg-zinc-50 rounded-lg px-4 py-3 text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                      {selected.admin_reply}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="border-t border-zinc-100 px-6 py-4 shrink-0 bg-zinc-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span className="text-xs font-medium text-zinc-500">
                    Reply to {selected.name}
                  </span>
                </div>
                <textarea
                  ref={replyRef}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d41920]/20 focus:border-[#d41920]/40 resize-none bg-white"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-zinc-400">
                    {selected.admin_reply
                      ? "This will update your previous reply"
                      : "Reply will be saved and visible in the conversation"}
                  </p>
                  <button
                    onClick={sendReply}
                    disabled={!reply.trim() || sending}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#d41920] rounded-lg hover:bg-[#b5151b] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending
                      ? "Saving..."
                      : selected.admin_reply
                      ? "Update Reply"
                      : "Send Reply"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
