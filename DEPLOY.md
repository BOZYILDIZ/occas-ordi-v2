# Déploiement Vercel — Occas Ordi V2

## 1. Base de données — Neon (gratuit)

1. Va sur [neon.tech](https://neon.tech) → **Sign up** (gratuit)
2. Crée un projet → choisis **Europe West** (Frankfurt)
3. Dans le dashboard Neon, copie les 2 URLs :
   - **Connection string** → pooled (ex: `postgresql://user:pass@ep-xxx-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require`)
   - **Direct connection** → non-pooled (ex: `postgresql://user:pass@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require`)

## 2. Pousser le code sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TON_COMPTE/occas-ordi-v2.git
git push -u origin main
```

## 3. Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com) → **New Project** → importe ton repo GitHub
2. Framework : **Next.js** (détecté automatiquement)
3. Build command : `next build` ✅ (le postinstall lance prisma generate automatiquement)
4. **Environment Variables** → ajouter :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | URL poolée Neon (`...pooler...?sslmode=require`) |
| `DIRECT_URL` | URL directe Neon (`...?sslmode=require`) |
| `AUTH_SECRET` | Générer : `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://ton-projet.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://ton-projet.vercel.app` |
| `MFA_ISSUER` | `OccasOrdi` |
| `GOOGLE_API_KEY` | (optionnel) |
| `GOOGLE_CSE_ID` | (optionnel) |

5. Clique **Deploy**

## 4. Après le premier déploiement — Initialiser la BDD

### Migrations (créer les tables)

Dans ton terminal **local** avec les variables d'env de prod :

```bash
# Copie temporairement l'URL directe dans DATABASE_URL
DATABASE_URL="postgresql://...directe..." npx prisma migrate deploy
```

Ou via [Vercel CLI](https://vercel.com/docs/cli) :
```bash
npm i -g vercel
vercel env pull .env.production.local
npx prisma migrate deploy
```

### Créer le compte admin

```bash
npm run seed
```

> ⚠️ Le mot de passe initial est `Admin123!` — **change-le immédiatement** dans `/admin/dashboard`

## 5. Changer l'URL dans les QR codes

Une fois ton domaine Vercel connu (`xxx.vercel.app` ou ton domaine custom), mets à jour :
- `NEXT_PUBLIC_APP_URL` dans les variables Vercel
- Redéploie pour que les nouvelles étiquettes aient la bonne URL de QR code

---

## Notes importantes

- `argon2` a été remplacé par `bcryptjs` (compatible Vercel, pur JavaScript)
- `prisma generate` se lance automatiquement via `postinstall` lors du `npm install` sur Vercel
- `DIRECT_URL` est utilisé pour les migrations (connexion sans pgBouncer), `DATABASE_URL` pour l'app
