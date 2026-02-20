import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ClientLayout } from "@/components/layout/client-layout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <ClientLayout session={session}>
      {children}
    </ClientLayout>
  );
}
