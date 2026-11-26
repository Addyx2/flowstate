import { AppSidebar } from "@/components/AppSidebar";
import { requireOffice } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOffice();
  return (
    <div className="flex min-h-screen">
      <AppSidebar user={{ name: user.name, role: user.role, agency: user.agency.name }} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
