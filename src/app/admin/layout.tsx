import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminClientLayout } from "@/components/layout/admin-client-layout";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    redirect("/dashboard");
  }

  return (
    <AdminClientLayout session={session}>
      {children}
    </AdminClientLayout>
  );
}
