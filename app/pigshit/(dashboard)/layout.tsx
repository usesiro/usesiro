import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // We'll move the actual security logic back to the middleware or a wrapper 
  // because this layout matches ALL subroutes including /admin/setup.
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
