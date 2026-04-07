"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Upload, Download, FileText, Clock } from "lucide-react";

type TicketFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
};

function formatSize(bytes: number) {
  if (!bytes || bytes === 0) return "";
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DownloadButton({ filePath, fileName }: { filePath: string; fileName: string }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("ticket-files")
      .download(filePath);

    if (data) {
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      console.error("Download failed:", error);
      alert("Failed to download.");
    }
    setDownloading(false);
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#d41920] hover:bg-red-50 border border-[#d41920]/20 rounded transition-colors disabled:opacity-50"
    >
      <Download size={13} />
      {downloading ? "..." : "Download"}
    </button>
  );
}

export function TicketFiles({
  ticketId,
  initialFiles,
  isAdmin,
  userId,
}: {
  ticketId: string;
  initialFiles: TicketFile[];
  isAdmin: boolean;
  userId: string;
}) {
  const [files, setFiles] = useState<TicketFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const originals = files.filter((f) => f.file_type === "original");
  const modified = files.filter((f) => f.file_type === "modified");
  const attachments = files.filter((f) => f.file_type === "attachment");

  // All files sorted by date for timeline
  const timeline = [...files].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  async function handleUploadModified(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabase = createClient();
    const filePath = `${userId}/${ticketId}/modified/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("ticket-files")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      alert("Upload failed. Try again.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("ticket-files")
      .getPublicUrl(filePath);

    const { data: savedFile, error: insertError } = await supabase
      .from("ticket_files")
      .insert({
        order_id: ticketId,
        uploaded_by: userId,
        file_name: file.name,
        file_path: filePath,
        file_url: urlData?.publicUrl || filePath,
        file_size: file.size,
        file_type: "modified",
      })
      .select()
      .single();

    if (savedFile) {
      setFiles((prev) => [...prev, savedFile]);
      // Auto-set ticket status to completed
      await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", ticketId);
    } else {
      console.error("Insert error:", insertError);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
    original: { label: "Original", color: "text-amber-600", bg: "bg-amber-50" },
    modified: { label: "Modified", color: "text-emerald-600", bg: "bg-emerald-50" },
    attachment: { label: "Attachment", color: "text-blue-600", bg: "bg-blue-50" },
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-900">Files</h2>
        <span className="text-xs text-zinc-400">{files.length} file{files.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="p-5">
        {/* Timeline */}
        {timeline.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-6">No files yet</p>
        ) : (
          <div className="space-y-0">
            {timeline.map((file, idx) => {
              const config = typeConfig[file.file_type] || typeConfig.attachment;
              const isLast = idx === timeline.length - 1;
              return (
                <div key={file.id} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center w-6 shrink-0">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                      file.file_type === "original" ? "bg-amber-500" :
                      file.file_type === "modified" ? "bg-emerald-500" : "bg-blue-500"
                    }`} />
                    {!isLast && <div className="w-px flex-1 bg-zinc-200 my-1" />}
                  </div>

                  {/* File card */}
                  <div className={`flex-1 flex items-center justify-between p-3 rounded-lg mb-2 overflow-hidden ${config.bg}`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(file.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-zinc-800 truncate">
                        {file.file_name}
                      </p>
                      {file.file_size > 0 && (
                        <p className="text-xs text-zinc-400">{formatSize(file.file_size)}</p>
                      )}
                    </div>
                    {file.file_path && (
                      <div className="ml-3 shrink-0">
                        <DownloadButton filePath={file.file_path} fileName={file.file_name} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload modified file (admin only) */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUploadModified}
              accept=".bin,.ori,.mod,.hex,.tun,.zip,.rar,.7z,.txt,.csv,.pdf,.bak,.frf,.sgm,.mtx,.map,.bdm,.dtc"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-emerald-300 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload Modified File"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
