"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Send, Paperclip, FileText, Download } from "lucide-react";

interface Message {
  id: string;
  sender_name: string;
  sender_role: string;
  message: string | null;
  created_at: string;
  user_id: string;
  ticket_files?: {
    id: string;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
  }[];
}

export function TicketChat({
  ticketId,
  initialMessages,
  isAdmin,
  userId,
  userName,
}: {
  ticketId: string;
  initialMessages: Message[];
  isAdmin: boolean;
  userId: string;
  userName: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `order_id=eq.${ticketId}`,
        },
        async (payload) => {
          // Only add if not from us (avoid duplicates)
          if (payload.new.user_id !== userId) {
            // Fetch the full message with files
            const { data } = await supabase
              .from("ticket_messages")
              .select("*")
              .eq("id", payload.new.id)
              .single();
            if (data) {
              setMessages((prev) => [...prev, data]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, userId]);

  async function handleSend() {
    if (!text.trim() && !file) return;
    setSending(true);

    try {
      const supabase = createClient();

      // Insert message
      const { data: msg, error: msgError } = await supabase
        .from("ticket_messages")
        .insert({
          order_id: ticketId,
          user_id: userId,
          sender_name: userName,
          sender_role: isAdmin ? "admin" : "client",
          message: text.trim() || (file ? `Attached: ${file.name}` : ""),
        })
        .select()
        .single();

      if (msgError) throw msgError;

      let fileData = null;

      // Upload file if present
      if (file && msg) {
        const filePath = `${userId}/${ticketId}/chat/${Date.now()}_${file.name}`;
        const { error: uploadErr } = await supabase.storage
          .from("ticket-files")
          .upload(filePath, file);

        if (!uploadErr) {
          const { data: savedFile } = await supabase
            .from("ticket_files")
            .insert({
              order_id: ticketId,
              message_id: msg.id,
              user_id: userId,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              file_type: isAdmin ? "modified" : "attachment",
            })
            .select()
            .single();

          fileData = savedFile;
        }
      }

      // Add to local state
      const newMsg: Message = {
        ...msg,
        ticket_files: fileData ? [fileData] : [],
      };
      setMessages((prev) => [...prev, newMsg]);
      setText("");
      setFile(null);
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-[700px]">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-zinc-900">
          💬 Comments / Response
        </h2>
        <span className="text-xs font-medium text-zinc-400">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10 text-zinc-400 text-sm">
            No messages yet. Start the conversation.
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.user_id === userId;
          const isAdminMsg = msg.sender_role === "admin";
          const time = new Date(msg.created_at).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const date = new Date(msg.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  isAdminMsg
                    ? "bg-[#d41920] text-white rounded-bl-md"
                    : "bg-zinc-100 text-zinc-800 rounded-br-md"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[11px] font-bold ${
                      isAdminMsg ? "text-white/80" : "text-zinc-500"
                    }`}
                  >
                    {msg.sender_name}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isAdminMsg ? "text-white/50" : "text-zinc-400"
                    }`}
                  >
                    {date} {time}
                  </span>
                </div>
                {msg.message && (
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                )}
                {/* Attached files */}
                {msg.ticket_files && msg.ticket_files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.ticket_files.map((f: any) => (
                      <div
                        key={f.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                          isAdminMsg
                            ? "bg-white/15 text-white"
                            : "bg-white text-zinc-700 border border-zinc-200"
                        }`}
                      >
                        <FileText size={14} />
                        <span className="truncate flex-1">{f.file_name}</span>
                        {f.file_type === "modified" && (
                          <span className="text-[10px] font-bold text-emerald-400 uppercase">
                            MOD
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-zinc-100 p-4">
        {file && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-zinc-50 rounded-lg text-xs">
            <FileText size={14} className="text-zinc-500" />
            <span className="text-zinc-700 font-medium truncate flex-1">
              {file.name}
            </span>
            <button
              onClick={() => setFile(null)}
              className="text-red-500 font-bold hover:underline"
            >
              Remove
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors shrink-0"
          >
            <Paperclip size={16} className="text-zinc-500" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-800 focus:outline-none focus:border-[#d41920] resize-none"
          />
          <button
            onClick={handleSend}
            disabled={sending || (!text.trim() && !file)}
            className="w-10 h-10 rounded-lg bg-[#d41920] hover:bg-[#b01018] flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
