/**
 * Seed — Crée le premier compte admin
 * Usage : npx tsx prisma/seed.ts
 *
 * ⚠️  Ne jamais committer les vrais mots de passe.
 *     Change le mot de passe après le premier lancement.
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  const email    = "admin@occas-ordi.fr";
  const password = "Admin123!";  // ← Change ça immédiatement après !
  const name     = "Administrateur";

  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where:  { email },
    update: {},
    create: {
      email,
      password: hash,
      name,
      role:        "SUPERADMIN",
      mfaEnabled:  false,
    },
  });

  console.log(`✅ Admin créé : ${user.email}`);
  console.log(`   Mot de passe initial : ${password}`);
  console.log(`   ⚠️  Change le mot de passe dès la première connexion !`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
