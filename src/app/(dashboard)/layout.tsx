import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar, Header } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="backoffice-theme flex min-h-screen bg-exhaust-dark text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 md:p-8 animate-fade-in bg-exhaust-dark">
          {children}
        </main>
      </div>
    </div>
  );
}
