// Script de création du compte admin
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Admin2024!", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@power-exhaust.com" },
    update: { password: hash, role: "ADMIN", name: "Admin" },
    create: { email: "admin@power-exhaust.com", password: hash, role: "ADMIN", name: "Admin" },
  });
  console.log("✅ Compte admin OK:", user.email, "| role:", user.role);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
