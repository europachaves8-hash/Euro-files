import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TicketChat } from "./ticket-chat";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin =
    user?.app_metadata?.userrole === "ADMIN" ||
    user?.app_metadata?.claims_admin === true ||
    user?.app_metadata?.role === "admin";

  // Fetch ticket
  const { data: ticket } = await supabase
    .from("orders")
    .select("*, order_items(id, product_name, price_credits)")
    .eq("id", id)
    .single();

  if (!ticket) return notFound();

  // Fetch files
  const { data: files } = await supabase
    .from("ticket_files")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  // Fetch messages
  const { data: messages } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500",
    in_progress: "bg-blue-500",
    completed: "bg-emerald-500",
    cancelled: "bg-zinc-400",
  };

  const vehicle = [ticket.vehicle_make, ticket.vehicle_model, ticket.vehicle_engine]
    .filter(Boolean)
    .join(" ");

  const originalFile = (files || []).find((f: any) => f.file_type === "original");
  const modifiedFile = (files || []).find((f: any) => f.file_type === "modified");

  const createdAt = new Date(ticket.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/tickets"
          className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
        >
          <ArrowLeft size={16} className="text-zinc-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Ticket #{ticket.id.slice(0, 8)}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white px-2.5 py-1 rounded-full ${
                statusColors[ticket.status] || "bg-zinc-400"
              }`}
            >
              {ticket.status?.replace("_", " ")}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">
            Created {createdAt} · Priority: {ticket.priority || "0-1 hour"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Left Column: Ticket Details */}
        <div className="space-y-5">
          {/* Vehicle & ECU Info */}
          <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-zinc-900">Ticket Details</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Vehicle</span>
                  <span className="font-medium text-zinc-800 text-right">{vehicle || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Year</span>
                  <span className="font-medium text-zinc-800">{ticket.vehicle_year || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Gearbox</span>
                  <span className="font-medium text-zinc-800">{ticket.vehicle_gearbox || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fuel</span>
                  <span className="font-medium text-zinc-800">{ticket.vehicle_fuel || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">ECU</span>
                  <span className="font-medium text-zinc-800">
                    {[ticket.ecu_producer, ticket.ecu_type].filter(Boolean).join(" ") || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Reading Tool</span>
                  <span className="font-medium text-zinc-800">{ticket.reading_tool || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Client</span>
                  <span className="font-medium text-zinc-800">{ticket.client_name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Price</span>
                  <span className="font-bold text-[#d41920]">
                    €{Number(ticket.price_eur || ticket.total_credits || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {ticket.notes && (
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-zinc-700">{ticket.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-zinc-900">Services</h2>
            </div>
            <div className="divide-y divide-zinc-50">
              {(ticket.order_items || []).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-zinc-700">{item.product_name}</span>
                  <span className="text-sm font-semibold text-zinc-800">
                    €{Number(item.price_credits || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-zinc-900">Files</h2>
            </div>
            <div className="p-5 space-y-3">
              {originalFile ? (
                <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                  <div>
                    <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-0.5">
                      Original File
                    </p>
                    <p className="text-sm font-medium text-zinc-800">
                      {originalFile.file_name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {(originalFile.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-400">No original file uploaded</p>
              )}

              {modifiedFile ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div>
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-0.5">
                      Modified File
                    </p>
                    <p className="text-sm font-medium text-zinc-800">
                      {modifiedFile.file_name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-zinc-50 rounded-lg">
                  <p className="text-sm text-zinc-400">
                    Modified file not yet available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat */}
        <TicketChat
          ticketId={ticket.id}
          initialMessages={messages || []}
          isAdmin={isAdmin}
          userId={user?.id || ""}
          userName={
            isAdmin
              ? "EUROFILES"
              : ticket.client_name || "Client"
          }
        />
      </div>
    </div>
  );
}
