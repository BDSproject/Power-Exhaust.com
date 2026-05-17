import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, Badge } from "@/components/ui";
import { Shield, User } from "lucide-react";

export const metadata = { title: "Gestion des utilisateurs" };

interface UtilisateurRow {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  _count: { rachats: number };
}

export default async function AdminUtilisateursPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const utilisateurs: UtilisateurRow[] = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { rachats: true } },
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Utilisateurs</h1>
        <p className="text-gray-400 font-medium mt-1">{utilisateurs.length} compte(s) enregistré(s)</p>
      </div>

      <div className="space-y-3">
        {utilisateurs.map((u) => (
          <Card key={u.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    {u.role === "ADMIN" ? (
                      <Shield className="h-5 w-5 text-exhaust-orange" />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{u.name || "(Sans nom)"}</p>
                      <Badge
                        className={
                          u.role === "ADMIN"
                            ? "bg-exhaust-orange text-white text-xs"
                            : "bg-white/10 text-gray-300 text-xs"
                        }
                      >
                        {u.role === "ADMIN" ? "Admin" : "Client"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{u.email}</p>
                    {u.phone && <p className="text-xs text-gray-400 font-medium">{u.phone}</p>}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-white">
                    {u._count.rachats} demande{u._count.rachats > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Inscrit le {formatDate(u.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
