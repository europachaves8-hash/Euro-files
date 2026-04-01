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
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Contacts
        </h1>
        {unread > 0 && (
          <span className="text-xs font-semibold text-white bg-[#e63956] px-3 py-1.5 rounded-full">
            {unread} unread
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Name
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Email
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Message
              </th>
              <th className="text-right px-5 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {contacts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-zinc-400 text-sm">
                  Nenhuma mensagem
                </td>
              </tr>
            )}
            {contacts.map((contact: any) => (
              <tr
                key={contact.id}
                className={`hover:bg-zinc-50/50 transition-colors ${
                  !contact.is_read ? "bg-blue-50/30" : ""
                }`}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {!contact.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e63956] shrink-0" />
                    )}
                    <span className="text-sm font-medium text-zinc-800">
                      {contact.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-zinc-500">
                  {contact.email}
                </td>
                <td className="px-5 py-3.5 text-sm text-zinc-600 max-w-[300px] truncate">
                  {contact.subject ? <strong>{contact.subject}: </strong> : null}
                  {contact.message}
                </td>
                <td className="px-5 py-3.5 text-sm text-zinc-400 text-right whitespace-nowrap">
                  {new Date(contact.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
