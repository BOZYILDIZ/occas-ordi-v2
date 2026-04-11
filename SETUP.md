# Occas Ordi V2 — Guide de démarrage

## 1. Configurer la base de données

Édite `.env` et remplace `DATABASE_URL` par ta connexion PostgreSQL :

```
DATABASE_URL="postgresql://postgres:TON_MOT_DE_PASSE@localhost:5432/occas_ordi"
```

Génère aussi un `AUTH_SECRET` :
```bash
openssl rand -base64 32
```

## 2. Migrer la base de données

```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 3. Créer le premier admin

```bash
npx tsx prisma/seed.ts
```

Email    : admin@occas-ordi.fr  
Password : Admin123!  ← **Changer immédiatement !**

## 4. Lancer le projet

```bash
npm run dev
```

Accès : http://localhost:3000  
Admin : http://localhost:3000/admin/login

## Structure des fichiers

```
src/
├── app/
│   ├── page.tsx                    # Accueil public
│   ├── catalogue/page.tsx          # Catalogue avec filtres
│   ├── admin/
│   │   ├── layout.tsx              # Layout sidebar admin (protégé)
│   │   ├── login/page.tsx          # Page de connexion + MFA
│   │   ├── dashboard/page.tsx      # Tableau de bord stock
│   │   ├── computers/new/page.tsx  # Formulaire ajout PC
│   │   ├── labels/page.tsx         # Impression étiquettes
│   │   └── mfa-setup/page.tsx      # Configuration MFA TOTP
│   └── api/
│       ├── computers/              # CRUD ordinateurs
│       └── admin/mfa/              # Routes MFA
├── components/
│   └── label/LabelPreview.tsx      # Composant étiquette 200×35mm
└── lib/
    ├── auth.ts                     # NextAuth v5 + Argon2 + TOTP
    ├── prisma.ts                   # Client Prisma singleton
    └── constants.ts                # Tous les choix prédéfinis

prisma/
├── schema.prisma                   # Schéma DB complet
└── seed.ts                         # Création admin initial
```

## Étiquettes — Positionnement fixe

| Zone     | X (mm) | Y (mm) |
|----------|--------|--------|
| SKU/Type | 5      | 4      |
| CPU      | 5      | 14     |
| RAM      | 72     | 14     |
| Stockage | 120    | 14     |
| Prix     | 155    | 8      |
| Grade    | 5      | 26     |

Format : **200mm × 35mm** — Impression A4 paysage, 5 étiquettes/page.
