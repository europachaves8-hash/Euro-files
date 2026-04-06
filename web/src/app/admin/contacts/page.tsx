import { createClient } from "@/lib/supabase-server";

async function getContacts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function ContactsPage() {
  const contacts = await getContacts();

  const unread = contacts.filter((c: any) => !c.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
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

      <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {contacts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm">No messages yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">
                  Subject
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">
                  Message
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">
                  Date
                </th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest border-l border-zinc-200/60">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {contacts.map((contact: any) => (
                <tr
                  key={contact.id}
                  className={`hover:bg-zinc-50/50 transition-colors ${
                    !contact.is_read ? "bg-blue-50/30" : ""
                  }`}
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-zinc-800">
                    {contact.name}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-500 border-l border-zinc-100">
                    {contact.email}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-zinc-700 border-l border-zinc-100">
                    {contact.subject || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600 max-w-[300px] truncate border-l border-zinc-100">
                    {contact.message}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap border-l border-zinc-100">
                    {new Date(contact.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3.5 text-center border-l border-zinc-100">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        contact.is_read ? "bg-zinc-300" : "bg-[#d41920]"
                      }`}
                      title={contact.is_read ? "Read" : "Unread"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
