import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar />

      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
